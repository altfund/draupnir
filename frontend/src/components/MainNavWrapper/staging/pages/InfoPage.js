import React from 'react'
import { Button } from 'react-bootstrap'
import ClientImageModal from '../../../Modal/ClientImageModal'
import _ from 'lodash'

export default function InfoPage({
  client, showModal, closeModal, showClientImageModal, closeImageModal,
  uploadPhoto, imageData
}){
  return (
    <div style={{ display: 'flex' }}>
      <div style={{  marginRight: '20%' }}>
        <h1>Contact</h1>
        <h3>Name: <span>{client.firstname + " " + client.lastname}</span></h3>
        <h3>Phone number: <span>{client.phone}</span></h3>
        <h3>Email: <span>{client.email}</span></h3>
      </div>
      <ClientImageModal
        showClientImageModal={ showClientImageModal }
        closeImageModal={ closeImageModal }
        uploadPhoto={ uploadPhoto }
        clientId={client._id} />
      <div>
        <h1>ID</h1> 
        <h3>{imageData.idType}</h3>
        <Button type="submit" bsStyle={'primary'} onClick={ () => showModal() }>Add</Button>
      </div>
    </div>
  )
}
