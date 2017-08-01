import React from 'react'
import { BrowserRouter as Router, Route, NavLink as Link } from 'react-router-dom'
import Staging from '../components/MainNavWrapper/staging/Staging'
import MessagesWrapper from '../components/MainNavWrapper/messages/MessagesWrapper'
import Logs from '../components/MainNavWrapper/Logs'
import Calculator from '../components/MainNavWrapper/Calculator/Calculator'
import Graphs from '../components/MainNavWrapper/Graphs'
import Settings from '../components/MainNavWrapper/settings/Settings'
import './component.css'
import './mainNav.css'

const style = {
    margin: '3.5%',
    fontSize: '2.5rem',
    textDecoration: 'none'
  }

export default function MainNav({
  ausPrices,
  changeRoute,
  clientModal,
  clientOrders,
  clientPage,
  clients,
  closeImageModal,
  expandedClientID,
  handleCreateOrder,
  handleDeleteOrder,
  handlePdfQuote,
  images,
  onClientBarExpand,
  onOrder,
  onOrderId,
  onRequest,
  onSend,
  onUpdate,
  orderUserId,
  orders,
  settings,
  showClientImageModal,
  showModal,
  tempOrder,
  uploadPhoto,
  onBtcUpdate,
  onEthUpdate,
  adminMessages,
  onCreateMessage,
  currentUser,
  onMessageDelete,
  onDeleteClient,
  showWarningDeleteModalClientClientId,
  showWarningDeleteModalOrderOrderId,
  onCloseWarningDeleteModal,
  onUpdateStatusTrue,
  onUpdateStatusFalse,
  openWarningDeleteModalClient,
  openWarningDeleteModalOrder
}) {
  const pageBodyStyle = {
    position: 'relative',
    width: '80%',
    margin: '0 auto'
  }
  return (
    <Router>
      <div>
        <div className="mainNav" style={{ marginTop: '2%', border: 'solid 1px' }}>
          <div className="mainNavLink">
            <Link to={'/home/staging'} activeStyle={{ color: 'white'}}> Staging </Link>
            <Link to={'/home/calculator'} activeStyle={{ color: 'white'}}> Calculator </Link>
            <Link to={'/home/messages'} activeStyle={{ color: 'white'}}> Messages </Link>
            <Link to={'/home/logs'} activeStyle={{ color: 'white'}}> Logs </Link>
            <Link to={'/home/graphs'} activeStyle={{ color: 'white'}}> Graphs </Link>
            <Link to={'/home/settings'} activeStyle={{ color: 'white'}}> Settings </Link>
          </div>       
        </div>
        <Route path='/home/staging' render={ () => (
          <Staging
            ausPrices={ ausPrices }
            changeRoute={ changeRoute }
            clientModal={ clientModal } 
            clientOrders={ clientOrders }
            clientPage={ clientPage }
            clients={ clients }
            closeImageModal={ closeImageModal }
            expandedClientID={ expandedClientID }
            handleCreateOrder={ handleCreateOrder }
            handleDeleteOrder={ handleDeleteOrder }
            handlePdfQuote={ handlePdfQuote }
            images={images}
            onClientBarExpand={ onClientBarExpand } 
            onOrder={ onOrder }
            onOrderId={ onOrderId }
            onSend={ onSend }
            onUpdate={ onUpdate }
            orderUserId={ orderUserId }
            orders={ orders }
            settings={ settings }
            showClientImageModal={showClientImageModal}
            showModal={ showModal }
            tempOrder={ tempOrder }
            onUpdateStatusTrue={ onUpdateStatusTrue }
            onUpdateStatusFalse={ onUpdateStatusFalse }
            uploadPhoto={ uploadPhoto }
            onDeleteClient={ onDeleteClient }
            showWarningDeleteModalClientClientId={ showWarningDeleteModalClientClientId }
            showWarningDeleteModalOrderOrderId={ showWarningDeleteModalOrderOrderId }
            openWarningDeleteModalClient={ openWarningDeleteModalClient }
            openWarningDeleteModalOrder={ openWarningDeleteModalOrder }
          />
        )
        } />
        <Route path='/home/calculator' render={() => (
          <div style={ pageBodyStyle }>
            <Calculator
              settings={ settings }
              orders={ orders }
              tempOrder={ tempOrder }
              onOrder={ onOrder }
              onOrderId={ onOrderId }
              orderUserId={ orderUserId }
            />
          </div>
        )
        } />
        <Route path='/home/messages' render={() => (
          <div style={ pageBodyStyle }>
            <MessagesWrapper
              adminMessages={ adminMessages }
              onCreateMessage={ onCreateMessage }
              currentUser={ !!currentUser ? currentUser : "" }
              onMessageDelete={ onMessageDelete }
            />
          </div>
        )
        } />
        <Route path='/home/logs' render={() => (
          <Logs />
        )
        } />
        <Route path='/home/Graphs' render={() => (
          <Graphs />
        )
        } />
        <Route path='/home/settings' render={() => (
          <div style={pageBodyStyle}>
          <Settings
            settings={ settings }
            onUpdate={ onUpdate }
            onBtcUpdate={ onBtcUpdate }
            onEthUpdate={ onEthUpdate }
          />
          </div>
        )
        } />
      </div>
    </Router>
  )
}
