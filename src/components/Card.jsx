import React from "react";

const Card = (props) => {
    return (
    <div className='album-card'>
        <h2>{props.idx + 1}. {props.name}</h2>
        <i className='date'>Released: {props.date}</i>
        <img src={props.url} />
        <span>Total tracks: {props.noOfTracks}</span>
    </div>
    )

}

export default Card;