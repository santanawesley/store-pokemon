import React from "react";
import { useNavigate, useParams } from 'react-router-dom';

import IconHome from "../../assets/homepage-icon.svg";
import "./index.css";

const DetailsPokemon = () => {
	const navigate = useNavigate();
  const {name} = useParams();

  return (
    <div className='details-page'>
      <img
        src={IconHome}
        alt="Página Inicial"
        className="icons icon-home"
        onClick={() => navigate("/")}
      />
      <h1>Detalhes do Pokémom escolhido: <br/>{name}</h1>
      <p>Em construção</p>
    </div>
  )
}

export default DetailsPokemon;