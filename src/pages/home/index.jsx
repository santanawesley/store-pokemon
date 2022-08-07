import React, { useState, useEffect } from "react";
import axios from "axios";
import baseApi from "../../services/api";
import ModalConfirmation from "../../components/modal";
import iconShoppingCart from "../../assets/icon_shopping_cart.svg";
import iconClose from "../../assets/icon_close.svg";
import "./index.css";

const Home = () => {
  const [listPokemon, setListPokemon] = useState([]);
  const [urlsAllPokemon, setUrlsAllPokemon] = useState([]);

  const [numberOfPages, setNumberOfPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [urlPreviousPage, setUrlPreviousPage] = useState("");
  const [urlNextPage, setUrlNextPage] = useState("");

  const [pokemonCart, setPokemonCart] = useState([]);
  const [showModal, setShowModal] = useState({});
  const [typedPokemon, setTypedPokemon] = useState("")
  const [wantedPokemon, setWantedPokemon] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    getPokemons();
    const pokemonStorage = localStorage.getItem("pokemonCart");
    pokemonStorage && setPokemonCart(JSON.parse(pokemonStorage));

    const getUrlsAllPokemons = async () => {
      const reponseAllPokemons = await baseApi.get("/pokemon?limit=100000&offset=0");
      setUrlsAllPokemon(reponseAllPokemons.data.results)
    }
    getUrlsAllPokemons();
  }, []);

  const getPokemons = async () => {
    const response = await baseApi.get("/pokemon");
    const pages = Math.ceil(response?.data ? response?.data?.count/20 : 0);
    setNumberOfPages(pages);
    _getPokemonsDetails(response?.data);
  }

  const _getPokemonsDetails = (data, origin) => {
    const urls = (origin === "search" ? data : data?.results).map(item => {
      return axios.get(item.url)
    })
    urls && axios.all(urls).then(responses => {
      const listPokemonsWithPrice = responses.map(item => {
        const price = _generatePrice(50, 500);
        item.data.price = _generatePrice(50, 500)
        return item;
      })
      origin === "search" ?
        setWantedPokemon(listPokemonsWithPrice) :
        setListPokemon(listPokemonsWithPrice)
    })

    setUrlPreviousPage(data.previous);
    setUrlNextPage(data.next);
  }

  const _generatePrice = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  useEffect(() => {
    pokemonCart.length && localStorage.setItem("pokemonCart", JSON.stringify(pokemonCart));
  }, [pokemonCart]);

  useEffect(() => {
    if(!showModal) return;
    const modal = document.getElementById("modal");
    modal && modal.addEventListener('click', showModal && (() => toogleModal()));
  }, [showModal])

  const addCart = (pokemon) => {
    setPokemonCart([...pokemonCart, pokemon]);
    toogleModal("Deu certo!", "Pokémon adicionado ao carrinho!")
  };

  const finalizePurchase = () => {
    setPokemonCart([]);
    localStorage.removeItem("pokemonCart");
    toogleModal("Parabéns!", "Pokém adquirido.");
  }

  const toogleModal = (title, description) => {
    description ? setShowModal({ title, description }) : setShowModal({});
  }

  const changePage = (direction) => {
    const page = direction === 'next' ? currentPage + 1 : currentPage - 1 ;
    setCurrentPage(page);
    setListPokemon([])

    const getUrlsPokemon = async () => {
      const url = direction === 'next' ? urlNextPage : urlPreviousPage;
      const response = await axios.get(url);
      _getPokemonsDetails(response.data)
    }
    getUrlsPokemon();
  }

  const searchPokemon = async (e) => {
    e.preventDefault();
    if(typedPokemon.trim().length === 0 && wantedPokemon.length) {
      setWantedPokemon([])
      return;       
    }

    if(typedPokemon.trim().length === 0 && !wantedPokemon.length) {
      toogleModal("Qual você deseja?", "Digite o nome do Pokémon que você procura.")
      return;       
    }
    if(!typedPokemon) return;

    const searchTypedPokemon = urlsAllPokemon.filter(pokemon => pokemon.name.includes(typedPokemon.toLowerCase()));
    searchTypedPokemon.length ?
      _getPokemonsDetails(searchTypedPokemon, "search") :
      toogleModal("Pokémon não encontrado", "Verifique se você digitou o nome certo")
  }

  const saveTypedPokemon = (e) => {
    const pokemonTyped = e.target.value;
    setTypedPokemon(pokemonTyped);
  }

  const clearSearch = (e) => {
    e.preventDefault();
    setWantedPokemon([])
    setTypedPokemon("")
  }

  const toogleCart = (action) => {
    action === "open" ? setShowCart(true) : setShowCart(false);
  }

  const toogleImage = (e, pokemon, action) => {
    action === "over" ?
      e.target.setAttribute("src", `${pokemon.data.sprites.back_default}`) :
      e.target.setAttribute("src", `${pokemon.data.sprites.front_default}`)
  }

  const cardPokemon = () => {
    return (
      wantedPokemon.length ? wantedPokemon : listPokemon).map((pokemon, index) => {
        return (
          <div className="item-pokemon" key={index}>
            <a onClick={() => addCart(pokemon)}>
              <img
                src={pokemon?.data?.sprites?.front_default}
                onMouseOver={(e) => toogleImage(e, pokemon, "over")}
                onMouseLeave={(e) => toogleImage(e, pokemon, "leave")}
                alt={`Imagem Pokémon ${pokemon?.data?.name}`}
              /><br/>
              <span className="name">{pokemon?.data?.name}</span><br/>
              <span className="value">R$ {pokemon?.data.price}</span>
            </a>
          </div>
        )
      }
    )
  }

  return (
    <>
      {showModal.description &&
        <ModalConfirmation
          closeModal={() => toogleModal()}
          className="modal-confirmation close-modal"
          title={showModal.title}
          description={showModal.description}
        />
      }
      <header>
        <div className="header-content">
          <form onSubmit={(e) => searchPokemon(e)}>
            <p>
              <input type="submit" value="" className={"magnifying-glass"}/>
              <input
                type="search"
                placeholder="Pesquisar"
                className="search"
                value={typedPokemon}
                onChange={(e) => saveTypedPokemon(e)}
              ></input>
            </p>
              <button
                type="submit"
                onClick={(e) => clearSearch(e)}
                className={`${wantedPokemon.length ? "clear-search" : "hidden-clear"}`}
              >
                Limpar pesquisa
              </button>
          </form>
          <a onClick={() => toogleCart("open")} className="shopping-cart">
            <img src={iconShoppingCart} alt="Carrinho de compras"/>
          </a>
        </div>
      </header>
      <main>
        <h1 className="title">
          {wantedPokemon.length ? "Pokémon encontrado" : "Traga você também os Pokémon para o seu mundo!"}
        </h1>
        <div className="product-and-cart">
          <div className="container-pokemon">
            {cardPokemon()}
          </div>

          <section className={`section-cart ${showCart ? "" : "hidden"}`} id="section-cart">
            <div className="info-cart">
              <p className="title-cart">
                Carrinho 
                <a className="close-cart" onClick={() => toogleCart("close")}>
                  <img src={iconClose} className="icon-close"/>
                </a>
              </p>
              <div className="product-cart">
                {pokemonCart?.map((product, index) => {
                  return (
                    <div className="pokemon-cart" key={index}>
                      <div className="image-name-cart">
                        <img src={product?.data?.sprites?.front_default} alt="Imagem do Pokémon escolhido"/>
                        <span className="name-cart">{product.data.name}</span>
                      </div>
                      <span className="value-cart">R$ {product.data.price}</span>
                    </div>
                  )
                })}
              </div>  
            </div>
            <div className="finalize-purchase">
              <div className="total-value">
                Total <span>R$ { pokemonCart?.length ? pokemonCart?.map((pokemon) => pokemon?.data.price).reduce((a, b) => a + b) : 0 }
                </span>
              </div>
              <button className="button-buy" disabled={!pokemonCart.length} onClick={() => finalizePurchase()}>
                Fechar Pedido
              </button>
            </div>
          </section>
        </div>
      </main>

      {!wantedPokemon.length && 
        <div className="pagination">
          <div className="footer">
            <a onClick={() => changePage("previous")} className={urlPreviousPage ? "" : "link-disabled"} >Página anterior</a>
            <span className="number-of-pages">{`${currentPage}/${numberOfPages}`}</span>
            <a onClick={() => changePage("next")} className={urlNextPage ? "" : "link-disabled"}>Próxima página</a>
          </div>
        </div>
      }
    </>
  )
}

export default Home;
