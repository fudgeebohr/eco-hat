import React, { useState } from 'react';
import { 
  ShoppingCart, X, Minus, Plus, AlertCircle, Trophy, 
  Book, PenTool, Pencil, FileText, Scissors, Highlighter, 
  Ruler, Eraser, Layers, ClipboardList 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './Rewards.css';

const Rewards = ({ userPoints = 750 }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showQR, setShowQR] = useState(false);

  // Expanded inventory data with Lucide Icons for cohesive aesthetic
  const rewardItems = [
    { id: 1, name: 'Notebook', price: 50, icon: <Book size={48} />, stock: 95 },
    { id: 2, name: 'Ballpen', price: 20, icon: <PenTool size={48} />, stock: 98 },
    { id: 3, name: 'Pencil', price: 15, icon: <Pencil size={48} />, stock: 89 },
    { id: 4, name: 'Yellow Paper', price: 40, icon: <FileText size={48} />, stock: 50 },
    { id: 5, name: 'Scissors', price: 60, icon: <Scissors size={48} />, stock: 30 },
    { id: 6, name: 'Crayons', price: 80, icon: <Highlighter size={48} />, stock: 25 },
    { id: 7, name: 'Ruler', price: 25, icon: <Ruler size={48} />, stock: 40 },
    { id: 8, name: 'Eraser', price: 10, icon: <Eraser size={48} />, stock: 120 },
    { id: 9, name: 'Folder', price: 15, icon: <Layers size={48} />, stock: 200 },
    { id: 10, name: 'Correction Tape', price: 45, icon: <ClipboardList size={48} />, stock: 15 },
  ];

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setShowQR(false);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setShowQR(false);
  };

  const totalCost = selectedItem ? selectedItem.price * quantity : 0;
  const canAfford = userPoints >= totalCost;

  return (
    <div className="rewards-container">
      {/* --- MATCHED BALANCE CARD --- */}
      <div className="card balance-card rewards-balance-header">
        <div className="balance-info">
          <p className="label">Available Balance</p>
          <h1 className="points-display">{userPoints}</h1>
        </div>
        <div className="rewards-status-icon">
           <Trophy size={48} color="var(--gold)" strokeWidth={1.5} />
        </div>
      </div>

      {/* --- REWARDS GRID --- */}
      <div className="rewards-grid">
        {rewardItems.map((item) => (
          <div key={item.id} className="reward-item-card">
            <div className="reward-icon-wrapper">{item.icon}</div>
            <h3 className="item-name">{item.name}</h3>
            <p className="item-price">{item.price} pts</p>
            <p className="item-stock">Stock: {item.stock}</p>
            <button 
              className="redeem-action-btn"
              onClick={() => handleOpenModal(item)}
            >
              Redeem
            </button>
          </div>
        ))}
      </div>

      {/* --- REDEMPTION MODAL --- */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="reward-modal card">
            <button className="close-modal" onClick={closeModal}><X size={20}/></button>
            
            {!showQR ? (
              <div className="modal-content">
                <div className="modal-header-section">
                  <ShoppingCart size={24} color="var(--maroon)" />
                  <h3>Redeem {selectedItem.name}</h3>
                </div>

                <div className="quantity-selector">
                  <p className="label">Select Quantity</p>
                  <div className="qty-controls">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={18}/></button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}><Plus size={18}/></button>
                  </div>
                </div>

                <div className="cost-summary">
                  <div className="cost-row">
                    <span>Total Cost:</span>
                    <span className={canAfford ? "maroon-text" : "error-text"}>{totalCost} pts</span>
                  </div>
                  {!canAfford && (
                    <p className="error-msg"><AlertCircle size={14}/> Insufficient points</p>
                  )}
                </div>

                <button 
                  className="confirm-btn" 
                  disabled={!canAfford}
                  onClick={() => setShowQR(true)}
                >
                  Generate QR Code
                </button>
              </div>
            ) : (
              <div className="modal-content qr-view">
                <h3 className="maroon-text">Redemption QR Code</h3>
                <p className="subtitle">Show this to the ECO-HAT Admin for approval</p>
                
                <div className="qr-wrapper">
                  <QRCodeSVG 
                    value={JSON.stringify({
                      itemId: selectedItem.id,
                      qty: quantity,
                      timestamp: Date.now()
                    })} 
                    size={180}
                    fgColor="#800000"
                    level="H"
                  />
                </div>

                <div className="qr-details">
                  <p className="qr-item-summary"><strong>{selectedItem.name}</strong> x {quantity}</p>
                  <p className="label">Scan to complete redemption</p>
                </div>
                <button className="done-btn" onClick={closeModal}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;