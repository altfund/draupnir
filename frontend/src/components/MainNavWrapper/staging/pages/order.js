import React from 'react';
import {
  Button,
  Well,
} from 'react-bootstrap';
import Moment from 'react-moment'
import NumberFormat from 'react-number-format'
import GoCheck from 'react-icons/lib/go/check'
import GoX from 'react-icons/lib/go/x'
import WarningDeleteModal from '../../../Modal/warningDeleteModal'
import './pages.css'

export default function Order({
  order,
  handleDeleteOrder,
  onUpdateStatusTrue,
  onUpdateStatusFalse,
  warningDeleteModal,
  clientId,
  openWarningDeleteModalOrder,
  openWarningOrderModal
}) {

  const quoteField = { 
    flexDirection: "row",
    fontSize: "1em",
    marginTop: "4px",
    marginRight: "4px"
  }

  const statusTypeToField = {
    quoteSent: 'quoteSent',
    quoteAccepted: 'quoteAccepted',
    depositCleared: 'depositCleared',
    orderComplete: 'orderComplete'
  }

  const quoteTrue = {
    flexDirection: "row",
    width: "10%",
    margin: "auto 0 9px",
    color: "#4CC941"
  }

  const quoteFalse = {
    flexDirection: "row",
    width: "10%",
    margin: "auto 0 9px",
    color: "#CB2424"
  }

  // const deleteOrder = (event, warningDeleteModal) => {
  //   event.preventDefault();
  //   const orderId = order._id;
  //   handleDeleteOrder({ orderId });
  // }

  const manageClientStatusTrue = (orderId, fieldName, onUpdateStatusTrue) => {
    const statusType = statusTypeToField[fieldName]
    onUpdateStatusTrue({ orderId, statusType })
  }

  const manageClientStatusFalse = (orderId, fieldName, onUpdateStatusTrue) => {
    const statusType = statusTypeToField[fieldName]
    onUpdateStatusFalse({ orderId, statusType })
  }

  return (
    <div style={{ color: '#969696'}}>
      <Well style={{backgroundColor: '#3b3b3b', borderColor: '#c4c4c4', marginBottom: '1rem', display: "flex", 
        height: "40px" }} bsSize='small'>
        
        <div style={{ flexDirection: "row", width: "20%", marginTop: "1px" }}>
          <NumberFormat value={order.amount} displayType={'text'} thousandSeparator={true} prefix={'$'} />
          {' of ' + order.coin + ' '}
        </div>
        
        <div style={{ flexDirection: "row", width: "14%" }}>
        {
          order.status.quoteSent ?
          <div style={{ display: "flex" }}>
            <h3 style={ quoteField }>Quote Sent</h3><span style={ quoteTrue }>
            <GoCheck onClick={() => (manageClientStatusFalse(order._id, "quoteSent", onUpdateStatusFalse))}
            className="toggleVerification" size={20}/></span>
          </div>
            :
          <div style={{ display: "flex", margin: "auto" }}>
            <h3 style={ quoteField }>Quote Sent</h3><span style={ quoteFalse }>
            <GoX style={{ flexDirection: "row" }} onClick={() => (manageClientStatusTrue(order._id, "quoteSent", onUpdateStatusTrue))} 
              className="toggleVerification" size={20} /></span>
          </div>
        }
        </div>

        <div style={{ flexDirection: "row", width: "14%" }}>
        {
          order.status.quoteAccepted ?
          <div style={{ display: "flex" }}>
            <h3 style={ quoteField }>Quote Accepted</h3><span style={ quoteTrue }>
            <GoCheck onClick={() => (manageClientStatusFalse(order._id, "quoteAccepted", onUpdateStatusFalse))}
            className="toggleVerification" size={20}/></span>
          </div>
            :
          <div style={{ display: "flex" }}>
            <h3 style={ quoteField }>Quote Accepted</h3><span style={ quoteFalse }>
            <GoX onClick={() => (manageClientStatusTrue(order._id, "quoteAccepted", onUpdateStatusTrue))} 
              className="toggleVerification" size={20} /></span>
          </div>
        }
        </div>

        <div style={{ flexDirection: "row", width: "14%" }}>
        {
          order.status.depositCleared ?
          <div style={{ display: "flex" }}>
            <h3 style={ quoteField }> Deposit Cleared</h3><span style={ quoteTrue }>
            <GoCheck onClick={() => (manageClientStatusFalse(order._id, "depositCleared", onUpdateStatusFalse))}
            className="toggleVerification" size={20}/></span>
          </div>
            :
          <div style={{ display: "flex" }}>
            <h3 style={ quoteField }> Deposit Cleared</h3><span style={ quoteFalse }>
            <GoX onClick={() => (manageClientStatusTrue(order._id, "depositCleared", onUpdateStatusTrue))} 
              className="toggleVerification" size={20} /></span>
          </div>
        }
        </div>

        <div style={{ flexDirection: "row", width: "14%" }}>
        {
          order.status.orderComplete ?
          <div style={{ display: "flex" }}>
            <h3 style={ quoteField }>Order Complete</h3><span style={ quoteTrue }>
            <GoCheck onClick={() => (manageClientStatusFalse(order._id, "orderComplete", onUpdateStatusFalse))}
            className="toggleVerification" size={20}/></span>
          </div>
            :
          <div style={{ display: "flex" }}>
            <h3 style={ quoteField }>Order Complete</h3><span style={ quoteFalse }>
            <GoX onClick={() => (manageClientStatusTrue(order._id, "orderComplete", onUpdateStatusTrue))} 
              className="toggleVerification" size={20} /></span>
          </div>
        }
        </div>
  

        <WarningDeleteModal
          showWarningDeleteModal={ openWarningOrderModal }
          warningDeleteModal={ openWarningDeleteModalOrder } // set state to show modal
          deleteFunction={ handleDeleteOrder } //
          model={ 'order' } ////
          id={ order._id }
        />
          
        <div style={{flexDirection: "row", width: "10%", textAlign: "center" }} >
          <Button 
            bsSize="xsmall"
            bsStyle="danger" type="submit" 
            onClick={ openWarningDeleteModalOrder }>
            Delete
          </Button> 
        </div>

        <div style={{  flexDirection: "row", width: "14%", textAlign: "right" }}>
          <Moment style={{color: "#a9a9a9" }} 
          fromNow interval={0} date={order.created} />
        </div>
      </Well>
    </div>
  )
}
