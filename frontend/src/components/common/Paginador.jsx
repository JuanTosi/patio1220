import { useEffect, useState } from 'react';
import "../../styles/components/paginador.css"
import Pagination from 'react-bootstrap/Pagination';

const Paginador = ({ paginaActual, totalPaginas, onChangePagina }) => {
    const [maxBotones, setMaxBotones] = useState(5)

    const clamp = (n) => Math.min(Math.max(n, 1), totalPaginas)
    const goTo = (n) => onChangePagina(clamp(n))
    let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2))
    let fin = inicio + maxBotones - 1

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    if (fin > totalPaginas) {
        fin = totalPaginas
        inicio = Math.max(1, fin - maxBotones + 1)
    }

    if (totalPaginas <= maxBotones) {
        inicio = 1
        fin = totalPaginas
    }

    const cantidad = Math.max(0, fin - inicio + 1)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setMaxBotones(3)
            } else if (window.innerWidth < 1200) {
                setMaxBotones(4);
            } else {
                setMaxBotones(5);
            }
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    if (!totalPaginas || totalPaginas < 2) return null;

    return (
        <div key={paginaActual} className="paginador transition-fade">
            <Pagination className="justify-content-center my-3">
                {paginaActual > 1 && totalPaginas > 5 && (<Pagination.First onClick={() => { goTo(1); scrollToTop() }} />)}

                {/* <Pagination.Prev disabled={paginaActual === 1} onClick={() => { goTo(paginaActual - 1);scrollToTop()}} /> */}

                {Array.from({ length: cantidad }, (_, i) => {
                    const num = inicio + i;
                    return (
                        <Pagination.Item
                            key={num}
                            active={num === paginaActual}
                            onClick={() => { goTo(num); scrollToTop() }}
                        >
                            {num}
                        </Pagination.Item>
                    );
                })}

                {/* <Pagination.Next disabled={paginaActual === totalPaginas} onClick={() => { goTo(paginaActual + 1); scrollToTop()}} /> */}

                {paginaActual < totalPaginas && totalPaginas > 5 && (<Pagination.Last onClick={() => { goTo(totalPaginas); scrollToTop() }} />)}
            </Pagination>
        </div>
    )
}

export default Paginador