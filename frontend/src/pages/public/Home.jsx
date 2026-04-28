import Carrusel from '../../components/home/Carrusel'
import MainHome from '../../components/home/MainHome';
import ProductosDestacados from '../../components/productos/ProductosDestacados';
import Visitanos from '../../components/home/Visitanos';

const Home = () => {
    return (
        <div className="home-container">
            <Carrusel />
            <MainHome />
            <ProductosDestacados />
            <Visitanos />
        </div>
    )
}

export default Home