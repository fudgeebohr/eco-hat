import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, X, Minus, Plus, AlertCircle, Trophy, 
  Book, PenTool, Pencil, FileText, Scissors, Highlighter, 
  Ruler, Eraser, Layers, ClipboardList, Trash2, Eye
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './Rewards.css';
import api from '../api'; 

const Rewards = ({ userPoints = 750, onPointsUpdate }) => {
  const [selectedItem, setSelectedItem] = useState(null); // Controls Add Qty Modal
  const [quantity, setQuantity] = useState(1);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false); // Controls View Cart Modal
  const [generatedQr, setGeneratedQr] = useState(null);
  const [cart, setCart] = useState([]);
  const [studentNumber, setStudentNumber] = useState('');
  const [checkoutSummary, setCheckoutSummary] = useState('');
  const [checkoutCost, setCheckoutCost] = useState(0);

  // ─── NEW: LIVE DATABASE REWARDS STOCK STATE ──────────────────────────────
  const [rewardItems, setRewardItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map icons dynamically to item names since MongoDB doesn't store JSX icons
  const getRewardIcon = (name) => {
    switch (name) {
      case 'Notebook': return <Book size={48} />;
      case 'Ballpen': return <PenTool size={48} />;
      case 'Pencil': return <Pencil size={48} />;
      case 'Yellow Paper': return <FileText size={48} />;
      case 'Scissors': return <Scissors size={48} />;
      case 'Crayons': return <Highlighter size={48} />;
      case 'Ruler': return <Ruler size={48} />;
      case 'Eraser': return <Eraser size={48} />;
      case 'Folder': return <Layers size={48} />;
      case 'Correction Tape': return <ClipboardList size={48} />;
      default: return <Book size={48} />;
    }
  };

  // 1. Fetch live stock values alongside user cloud cart on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Execute profile and public catalog syncs simultaneously
        const [profileRes, inventoryRes] = await Promise.all([
          api.get('/profile'),
          api.get('/rewards/inventory') // ◄ Hit the public student read endpoint we made
        ]);

        if (profileRes.data) {
          if (profileRes.data.cart) setCart(profileRes.data.cart);
          if (profileRes.data.studentNumber) setStudentNumber(profileRes.data.studentNumber);
        }

        if (inventoryRes.data?.success) {
          // Attach JSX icons to data array records
          const parsedItems = inventoryRes.data.inventory.map(item => ({
            ...item,
            icon: getRewardIcon(item.name)
          }));
          setRewardItems(parsedItems);
        }
      } catch (error) {
        console.error("Initialization Sync Broken:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [generatedQr]); // Re-fetch to update local stock limits when a checkout completes!

  // 2. Automatically push mutations up to your MongoDB cluster
  useEffect(() => {
    if (cart.length === 0) return;

    const syncCartToCloud = async () => {
      try {
        await api.post('/cart/sync', { cart });
      } catch (error) {
        console.error("Cross-device sync layer communication breakdowns:", error);
      }
    };

    const delayDebounce = setTimeout(() => {
      syncCartToCloud();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [cart]);

  // Calculate unique item count and totals
  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCost = selectedItem ? selectedItem.price * quantity : 0;
  
  // ─── UPDATED BOUNDARIES: STOCK CONSTRAINT VALIDATION ──────────────────────
  const canAfford = userPoints >= totalCost;
  const isStockAvailable = selectedItem ? selectedItem.stock >= quantity : true;

  const addToCart = (item, selectedQty) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.itemId === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.itemId === item.id 
            ? { ...cartItem, quantity: Math.min(item.stock, cartItem.quantity + selectedQty) } 
            : cartItem
        );
      }
      return [...prevCart, { itemId: item.id, name: item.name, price: item.price, quantity: selectedQty }];
    });
    setSelectedItem(null);
  };

  const updateQuantity = (itemId, amount) => {
    // Find item stock reference boundary
    const referenceItem = rewardItems.find(r => r.id === itemId);
    const maxStock = referenceItem ? referenceItem.stock : 99;

    setCart(prevCart => prevCart.map(item => {
      if (item.itemId === itemId) {
        const newQty = item.quantity + amount;
        return newQty > 0 ? { ...item, quantity: Math.min(maxStock, newQty) } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.itemId !== itemId));
  };

  const closeModal = () => setSelectedItem(null);

  const handleCheckoutCart = async () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    if (userPoints < totalCartCost) {
      return alert("Insufficient points balance for this checkout transaction.");
    }

    try {
      const payload = {
        items: cart.map(item => ({
          itemId: item.itemId, // Fix item mapping reference error 
          name: item.name,
          quantity: item.quantity,
          pointsDeducted: item.price * item.quantity
        })),
        totalCost: totalCartCost
      };

      const response = await api.post('/rewards/checkout-cart', payload);

      if (response.data.success) {
        const summaryText = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
        setCheckoutSummary(summaryText);
        setCheckoutCost(totalCartCost); 

        setGeneratedQr(response.data.qrTokenString); 
        setCart([]); 
        localStorage.removeItem('ecohat_cart'); 
        alert("Checkout successful! Your unified QR code has been generated.");
      }
    } catch (error) {
      console.error("Cart checkout error:", error);
      alert(error.response?.data?.message || "Checkout processing encountered an error.");
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: 'var(--maroon)', fontWeight: 'bold' }}>Loading campus rewards catalog...</div>;
  }

  return (
    <div className="rewards-container">
      {/* --- SIDE-BY-SIDE HEADER ROW --- */}
      <div className="rewards-header-row">
        
        {/* LEFT: AVAILABLE BALANCE CARD */}
        <div className="card balance-card" style={{ margin: 0, height: '100%' }}>
          <div className="balance-info">
            <p className="label">Available Balance</p>
            <h1 className="points-display">{userPoints}</h1>
          </div>
          <div className="rewards-status-icon">
            <Trophy size={48} color="var(--gold)" strokeWidth={1.5} />
          </div>
        </div>

        {/* RIGHT: REDEMPTION CART SUMMARY OVERVIEW */}
        <div className="card balance-card" style={{ margin: 0, height: '100%' }}>
          <div className="balance-info">
            <p className="label">School Bag</p>
            <h1 className="points-display" style={{ color: 'var(--maroon)' }}>
              {totalCartItemsCount} <span style={{ fontSize: '1.5rem', color: '#666' }}>Item/s</span>
            </h1>
          </div>
          <button className="view-cart-btn" onClick={() => setIsCartModalOpen(true)}>
            <Eye size={18} /> View Bag ({totalCartCost} pts)
          </button>
        </div>

      </div>

      {/* --- REWARDS GRID (NOW EXTRACTING LIVE MONGODB DATA) --- */}
      <div className="rewards-grid-full">
        {rewardItems.map((item) => (
          <div key={item.id} className="reward-item-card" style={{ opacity: item.stock === 0 ? 0.6 : 1 }}>
            <div className="reward-icon-wrapper">{item.icon}</div>
            <h3 className="item-name">{item.name}</h3>
            <p className="item-price">{item.price} pts</p>
            
            {/* DYNAMIC STOCK TEXT SHADING */}
            <p className="item-stock" style={{ color: item.stock === 0 ? '#dc2626' : '#666', fontWeight: item.stock === 0 ? 'bold' : 'normal' }}>
              {item.stock > 0 ? `Stock: ${item.stock}` : 'OUT OF STOCK'}
            </p>
            
            <button 
              className="redeem-action-btn" 
              onClick={() => { setSelectedItem(item); setQuantity(1); }}
              disabled={item.stock === 0}
              style={{ background: item.stock === 0 ? '#ccc' : 'var(--maroon)', cursor: item.stock === 0 ? 'not-allowed' : 'pointer' }}
            >
              {item.stock > 0 ? 'Add to Bag' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>

      {/* --- VIEW CART MODAL --- */}
      {isCartModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '450px', width: '90%', padding: '25px', position: 'relative' }}>
            <button className="modal-close-btn" onClick={() => { setIsCartModalOpen(false); setGeneratedQr(null); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            {!generatedQr ? (
              <>
                <div className="modal-header-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <ShoppingCart size={24} color="var(--maroon)" />
                  <h3 style={{ margin: 0 }}>Review Your Bag</h3>
                </div>

                {cart.length === 0 ? (
                  <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '30px 0' }}>Your bag is empty.</p>
                ) : (
                  <>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
                      {cart.map(item => (
                        <div key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                          <div>
                            <p style={{ fontWeight: '600', margin: 0 }}>{item.name}</p>
                            <span style={{ fontSize: '12px', color: '#666' }}>{item.price * item.quantity} pts</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => updateQuantity(item.itemId, -1)} style={{ padding: '2px 6px' }}><Minus size={12}/></button>
                            <span style={{ minWidth: '15px', textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.itemId, 1)} style={{ padding: '2px 6px' }}><Plus size={12}/></button>
                            <button onClick={() => removeFromCart(item.itemId)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '5px' }}><Trash2 size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '2px solid #eee', paddingTop: '15px', marginBottom: '20px' }}>
                      <span>Total Cost:</span>
                      <span style={{ color: 'var(--maroon)' }}>{totalCartCost} pts</span>
                    </div>

                    <button className="modal-save-btn" onClick={handleCheckoutCart} disabled={userPoints < totalCartCost} style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}>
                      Generate Single QR Code
                    </button>
                  </>
                )}
              </>
            ) : (
              /* --- BATCH REDEMPTION QR VIEW --- */
              <div className="modal-content qr-view">
                <h3 className="maroon-text" style={{ marginBottom: '5px' }}>Redemption QR Code</h3>
                <p className="subtitle" style={{ marginBottom: '20px' }}>Scan this single-use token at the kiosk</p>
                
                <div className="qr-wrapper">
                  <QRCodeSVG value={JSON.stringify({
                    token: generatedQr,
                    studentNum: studentNumber || localStorage.getItem('studentNumber') || 'Unknown', 
                    cost: checkoutCost, 
                    items: checkoutSummary
                  })} size={220} fgColor="#800000" level="M" />
                </div>

                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px', margin: '15px 0', fontWeight: 'bold', wordBreak: 'break-all', width: '100%', boxSizing: 'border-box' }}>
                  {generatedQr}
                </div>
                
                <button className="modal-cancel-btn" onClick={() => { setIsCartModalOpen(false); setGeneratedQr(null); }} style={{ width: '100%', marginTop: '10px' }}>
                  Close & Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ADD TO CART QUANTITY MODAL --- */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="reward-modal card" style={{ padding: '24px', maxWidth: '400px', width: '90%' }}>
            <button className="close-modal" onClick={closeModal}><X size={20}/></button>
            <div className="modal-content">
              <div className="modal-header-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <ShoppingCart size={24} color="var(--maroon)" />
                <h3 style={{ margin: 0 }}>Add {selectedItem.name}</h3>
              </div>

              <div className="quantity-selector" style={{ margin: '20px 0' }}>
                <p className="label">Select Quantity (Max Available: {selectedItem.stock})</p>
                <div className="qty-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={18}/></button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{quantity}</span>
                  {/* Lock the plus button incrementer to current live stock availability limits */}
                  <button onClick={() => setQuantity(Math.min(selectedItem.stock, quantity + 1))} disabled={quantity >= selectedItem.stock}><Plus size={18}/></button>
                </div>
              </div>

              <div className="cost-summary" style={{ background: '#fafafa', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                <div className="cost-row" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                  <span>Total Point Cost:</span>
                  <span className={canAfford ? "maroon-text" : "error-text"}>{totalCost} pts</span>
                </div>
                {!canAfford && (
                  <p className="error-msg" style={{ margin: '8px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '13px' }}><AlertCircle size={14}/> Insufficient points balance</p>
                )}
                {!isStockAvailable && (
                  <p className="error-msg" style={{ margin: '8px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '13px' }}><AlertCircle size={14}/> Selected quantity exceeds current available inventory</p>
                )}
              </div>

              <button className="modal-save-btn" disabled={!canAfford || !isStockAvailable || selectedItem.stock === 0} onClick={() => addToCart(selectedItem, quantity)} style={{ width: '100%' }}>
                Confirm to Bag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;