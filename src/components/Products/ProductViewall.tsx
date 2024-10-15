import { useEffect, useState } from "react";
import "./style.css"; // Assuming the styles are shared
import { useParams  } from "react-router-dom";
import {
  listProductsApi,
  ProductSearchPayload,
} from "../../services/api/products";
import ProductCard from "../ProductCard";
import { Loader } from "../shared";

const categories = [
  { name: "All", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },

  { name: "Paan Corner", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  {
    name: "Vegetables & Fruits ",
    icon: "https://i.postimg.cc/DzTwNjM0/19.webp",
  },
  {
    name: "Instant & Frozen Food",
    icon: "https://i.postimg.cc/DzTwNjM0/19.webp",
  },
  { name: "Atta, Rice & Dai", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  {
    name: "Cleaning Essentials",
    icon: "https://i.postimg.cc/DzTwNjM0/19.webp",
  },
  { name: "Dairy & Breakfast", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  {
    name: "Tea, Coffee & Health Drinks",
    icon: "https://i.postimg.cc/DzTwNjM0/19.webp",
  },
  {
    name: "Dry Fruits, Masala & Oil",
    icon: "https://i.postimg.cc/DzTwNjM0/19.webp",
  },
  { name: "Organic & Premium", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  { name: "Home & Office", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  { name: "Munchies", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  { name: "Bakery & Biscuits", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  { name: "Sauces & Spreads", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  { name: "Baby Care", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  { name: "Personal Care", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  {
    name: "Cold Drinks & Juices",
    icon: "https://i.postimg.cc/DzTwNjM0/19.webp",
  },
  { name: "Sweet Tooth", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  {
    name: "Chicken, Meat & Fish",
    icon: "https://i.postimg.cc/DzTwNjM0/19.webp",
  },
  { name: "Pharma & Wellness", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
  { name: "Pet Care", icon: "https://i.postimg.cc/DzTwNjM0/19.webp" },
];

const ProductViewAll: React.FC = () => {
  const param = useParams();
  const [shopId, setShopId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState(categories[0].name);
  const [products, setProducts] = useState<any[]>([]);
  const [shopName, setShopName] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setProducts([]);
      setLoading(true);
      const data: ProductSearchPayload = {
        searchText: "",
        shopId: param.shopId,
        category: category,
        nearby: false,
        page: 1,
        limit: 50,
      };

      const response = await listProductsApi(data);
      console.log(response);
      
      setLoading(false);
      setProducts(response[0].products);
      setShopName(response[0].shopName);
    };

    fetchData();
  }, [category]);

  useEffect(() => {
    setShopId(param.shopId || "");
  }, []);

  return (
    <div className="product-view-all container border">
      <div
        className="category-bar"
        style={{
          width: "20%",
          borderRight: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          scrollbarWidth:'none'
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`category-button ${
              category === cat.name ? "active" : ""
            }`}
            onClick={() => setCategory(cat.name)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.75rem 1rem",
              border: "none",
              borderBottom:'1px solid #dddddd',
              backgroundColor: category === cat.name ? "#F0F8E7" : "white",
              borderLeft:
                category === cat.name
                  ? "5px solid green"
                  : "5px solid transparent",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <img
              src={cat.icon}
              alt={cat.name}
              style={{
                width: "50px",
                height: "50px",
                marginRight: "10px",
              }}
            />
            <p className="font-normal">{cat.name}</p>
          </button>
        ))}
      </div>

      <div
        className="_container"
        style={{
          width: "100%",
          backgroundColor: "#F4F6FB",
        }}
      >
        <div className="w-full flex flex-row justify-between items-center py-3 px-4 border-b bg-white">
          { shopId && <h1 className="text-[18px] font-medium text-[#333]">{shopName}</h1> }
          <p className="font-medium text-[#333]">total: {products.length} items</p>
        </div>
        <div
          className="_container"
          style={{
            width: "100%",
            display: "flex",
            gap: "8px",
            padding: "8px",
            backgroundColor: "#F4F6FB",
            flexWrap: 'wrap'
          }}
        >
          {loading ? <Loader/> :
          products.length > 0 ? products.map((product) => (
            <ProductCard key={product.id} data={product} />
          )) : <h1>No data</h1>}
        </div>
      </div>
    </div>
  );
};

export default ProductViewAll;
