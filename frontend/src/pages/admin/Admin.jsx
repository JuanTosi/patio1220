import { Routes, Route } from "react-router-dom";
import ProductoCrudTable from "../../components/productos/ProductoCrudTable";

const Admin = () => {

    return (
        <div style={{ padding: "20px" }}>
            <ProductoCrudTable />
            <Routes>
                <Route path="/" element="" />
                <Route path="productos" element={<ProductoCrudTable />} />
                <Route path="servicios" element="" />
                <Route path="" element="" />
            </Routes>
        </div>
    );
};

export default Admin;