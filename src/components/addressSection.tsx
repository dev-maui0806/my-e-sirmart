import React, { useEffect, useRef, useState } from "react";
import './AddressSelection.css';
import { GOOGLE_MAP_API_KEY } from "../services/url";

interface MapOptions {
  center: google.maps.LatLngLiteral; // or google.maps.LatLng
  fullscreenControl: boolean;
  mapTypeControl: boolean;
  streetViewControl: boolean;
  zoom: number;
  zoomControl: boolean;
  maxZoom: number;
  mapId: string;
}

interface Configuration {
  ctaTitle: string;
  mapOptions: MapOptions;
  mapsApiKey: string; // Assuming GOOGLE_MAP_API_KEY is a string
  capabilities: {
    addressAutocompleteControl: boolean;
    mapDisplayControl: boolean;
    ctaControl: boolean;
  };
}

const CONFIGURATION: Configuration = {
  ctaTitle: "Confirm Address",
  mapOptions: {
    center: { lat: 0, lng: 0 }, // Set default values (0,0) or use valid coordinates
    fullscreenControl: true,
    mapTypeControl: false,
    streetViewControl: true,
    zoom: 15,
    zoomControl: true,
    maxZoom: 22,
    mapId: ""
  },
  mapsApiKey: GOOGLE_MAP_API_KEY, // Ensure this variable is defined and accessible
  capabilities: {
    addressAutocompleteControl: true,
    mapDisplayControl: true,
    ctaControl: true
  }
};

const SHORT_NAME_ADDRESS_COMPONENT_TYPES = new Set([
  "street_number",
  "administrative_area_level_1",
  "postal_code"
]);

const ADDRESS_COMPONENT_TYPES_IN_FORM = [
  "location",
  "locality",
  "administrative_area_level_1",
  "postal_code",
  "country"
];

const AddressSelection: React.FC<{ onAddressSelect: (lat: number, lng: number) => void }> = ({ onAddressSelect  }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null); // To reference the map container
  const mapInstanceRef = useRef<google.maps.Map | null>(null); // To store the Google Maps instance
  const markerRef = useRef<google.maps.Marker | null>(null); // To store the marker instance

  // State to store form values
  const [formData, setFormData] = useState({
    location: "",
    locality: "",
    administrative_area_level_1: "",
    postal_code: "",
    country: ""
  });
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      const { Autocomplete } : any = await window.google.maps.importLibrary("places");

      const mapOptions = CONFIGURATION.mapOptions;
      mapOptions.mapId = mapOptions.mapId || "DEMO_MAP_ID";

      // Initialize map and marker
      const map = new window.google.maps.Map(mapContainerRef.current!, mapOptions);
      mapInstanceRef.current = map; // Store the map instance

      // Initialize a red marker for the address location
      const marker = new window.google.maps.Marker({
        map,
        position: mapOptions.center, // Set initial marker position to the center of the map
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // URL of the red marker icon
        },
      });
      markerRef.current = marker; // Store the marker instance

      // Initialize autocomplete for location input
      const autocomplete = new Autocomplete(
        document.getElementById("location-input") as HTMLInputElement,
        {
          fields: ["address_components", "geometry", "name"],
          types: ["address"],
        }
      );

      // When the user selects a place from the autocomplete suggestions
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location?.lat() || 0;
          const lng = place.geometry.location?.lng() || 0;
          setCoordinates({ lat, lng });
          renderAddress(place);
          fillInAddress(place);
          renderAddress(place);
          fillInAddress(place);
        }
      });
    };

    const renderAddress = (place: google.maps.places.PlaceResult) => {
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat(); // Get latitude
        const lng = place.geometry.location.lng(); // Get longitude

        const mapOptions = CONFIGURATION.mapOptions;
        mapOptions.center = { lat: lat, lng: lng};

        // Set center and zoom of the map to the selected place
        mapInstanceRef.current?.setCenter(place.geometry.location); // Use the stored map instance
        mapInstanceRef.current?.setZoom(15); // Zoom in on the selected location

        // Set marker position and make it visible on the map
        markerRef.current?.setPosition(place.geometry.location);
        markerRef.current?.setVisible(true); // Ensure the marker is visible
      } else {
        markerRef.current?.setPosition(null); // Reset marker if no location
        markerRef.current?.setVisible(false); // Hide the marker
      }
    };

    const fillInAddress = (place: google.maps.places.PlaceResult) => {
      const getComponentName = (componentType: string) => {
        for (const component of place.address_components || []) {
          if (component.types[0] === componentType) {
            return SHORT_NAME_ADDRESS_COMPONENT_TYPES.has(componentType)
              ? component.short_name
              : component.long_name;
          }
        }
        return "";
      };

      const getComponentText = (componentType: string) =>
        componentType === "location"
          ? `${getComponentName("street_number")} ${getComponentName("route")}`
          : getComponentName(componentType);

      const updatedFormData = { ...formData };
      for (const componentType of ADDRESS_COMPONENT_TYPES_IN_FORM) {
        updatedFormData[componentType as keyof typeof formData] = getComponentText(componentType);
      }

      setFormData(updatedFormData);
    };

    // Load the Google Maps script if not already present
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIGURATION.mapsApiKey}&libraries=places`;
      script.async = true;
      script.onload = loadGoogleMaps;
      document.body.appendChild(script);
    } else {
      loadGoogleMaps();
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id.split('-')[0]]: value,
    });
  };

  const handleAddressConfirm = () => {
    if (coordinates) {
      onAddressSelect(coordinates.lat, coordinates.lng);
    }
  };



  return (
    <div className="address-selection">
      <div ref={mapContainerRef} className="map-container"></div>
      <div className="panel">
        <div>
          <img
            className="sb-title-icon"
            src="https://fonts.gstatic.com/s/i/googlematerialicons/location_pin/v5/24px.svg"
            alt="Address Icon"
          />
          <span className="sb-title">Address Selection</span>
        </div>
        <input
          type="text"
          placeholder="Address"
          id="location-input"
          value={formData.location}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="City"
          id="locality-input"
          value={formData.locality}
          onChange={handleInputChange}
          readOnly
        />
        <div className="half-input-container">
          <input
            type="text"
            className="half-input"
            placeholder="State/Province"
            id="administrative_area_level_1-input"
            value={formData.administrative_area_level_1}
            onChange={handleInputChange}
            readOnly
          />
          <input
            type="text"
            className="half-input"
            placeholder="Zip/Postal code"
            id="postal_code-input"
            value={formData.postal_code}
            onChange={handleInputChange}
            readOnly
          />
        </div>
        <input
          type="text"
          placeholder="Country"
          id="country-input"
          value={formData.country}
          readOnly
        />
        <button className="checkout-btn" onClick={handleAddressConfirm}>
          Confirm Address
        </button>
      </div>
    </div>
  );
};

export default AddressSelection;

