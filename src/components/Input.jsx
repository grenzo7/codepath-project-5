import React from "react";

const Input = (props) => {
    const handlePress = (e) => {
        if (e.key == 'Enter'){
            props.search(e);
        }
    }
    return  (
        <div className="form-container">
            <form>
                <input type="text" placeholder="Your Favourite Artist..." className="form-text" id="user-response" value={props.searchInput} onClick={handlePress} onChange={(e) => props.setSearchInput(e.target.value)}/>
                <input type="submit" className="form-submit" onClick={(e) => props.search(e)} value="Submit" />
            </form>
        </div>    
        )
}

export default Input;