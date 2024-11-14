import React from 'react';
import avatarPlaceholder from './avatar-placeholder.jpg';
import './Avatar.css'

{/*Avatar component, so we can reuse it when creating other user's pages!
    REDUNDANT CODE. NOT IMPLEMENTED OR USED.*/}

const Avatar = ({src,alt, changeAvatar}) => {
    const styles = {
        borderRadius: '50%',
        width: '200px',
        height: '200px',
        cursor: 'pointer',
        objectFit:'cover',
        marginTop:'50px',
    };

    const editAvatar = (event) => {
        //TO DO: Implement
    };

    return(
        //if no other src, use avatarplaceholder.
        <div id="imgAndInputDiv">

        <img src={src  || avatarPlaceholder} alt={alt} style={styles} onClick={() => document.getElementById('avatarFile').click()}/>
        <input type="file" id="avatarFile" accept="image/*" onChange={changeAvatar} style={{ display: 'none' }}/> 
        </div>
     
    );
}
export default Avatar;