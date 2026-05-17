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

  // 1. Fetch the cloud cart array on component mounting sessions
  useEffect(() => {
    const fetchCloudCart = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data && response.data.cart) {
          setCart(response.data.cart);
        }
      } catch (error) {
        console.error("Failed to recover multi-device cart configurations:", error);
      }
    };
    fetchCloudCart();
  }, []);

  // 2. Automatically push mutations up to your MongoDB cluster
  useEffect(() => {
    // Prevent executing an API post request if the user hasn't completed baseline mount loading checks
    if (cart.length === 0) return;

    const syncCartToCloud = async () => {
      try {
        await api.post('/cart/sync', { cart });
      } catch (error) {
        console.error("Cross-device sync layer communication breakdowns:", error);
      }
    };

    // Setting up a minor timeout debounce stops your application from spamming requests while clicking quantity buttons
    const delayDebounce = setTimeout(() => {
      syncCartToCloud();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [cart]);

  // Calculate unique item count and totals
  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCost = selectedItem ? selectedItem.price * quantity : 0;
  const canAfford = userPoints >= totalCost;

  const addToCart = (item, selectedQty) => {
    setCart(prevCart => {
      // Look for itemId tracking variables returning from our schema model
      const existingItem = prevCart.find(cartItem => cartItem.itemId === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.itemId === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + selectedQty } 
            : cartItem
        );
      }
      return [...prevCart, { itemId: item.id, name: item.name, price: item.price, quantity: selectedQty }];
    });
    setSelectedItem(null);
  };

  // Inline adjustment inside the side panel modal
  const updateQuantity = (itemId, amount) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.itemId === itemId) {
        const newQty = item.quantity + amount;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.itemId !== itemId));
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleCheckoutCart = async () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    if (userPoints < totalCartCost) {
      return alert("Insufficient points balance for this checkout transaction.");
    }

    try {
      const payload = {
        items: cart.map(item => ({
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          pointsDeducted: item.price * item.quantity
        })),
        totalCost: totalCartCost
      };

      const response = await api.post('/rewards/checkout-cart', payload);

      if (response.data.success) {
        setGeneratedQr(response.data.qrTokenString); 
        setCart([]); // Empty out local React cart state
        
        // ADDED HERE: Clear persistent cache so the cart is empty on next render
        localStorage.removeItem('ecohat_cart'); 
        
        if (onPointsUpdate) onPointsUpdate(userPoints - totalCartCost);
        
        // Optional: Alert the user that the code has been successfully bundled
        alert("Checkout successful! Your unified QR code has been generated.");
      }
    } catch (error) {
      console.error("Cart checkout error:", error);
      alert(error.response?.data?.message || "Checkout processing encountered an error.");
    }
  };

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

      {/* --- REWARDS GRID (FULL WIDTH) --- */}
      <div className="rewards-grid-full">
        {rewardItems.map((item) => (
          <div key={item.id} className="reward-item-card">
            <div className="reward-icon-wrapper">{item.icon}</div>
            <h3 className="item-name">{item.name}</h3>
            <p className="item-price">{item.price} pts</p>
            <p className="item-stock">Stock: {item.stock}</p>
            <button className="redeem-action-btn" onClick={() => { setSelectedItem(item); setQuantity(1); }}>
              Add to Bag
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
                        // 1. UPDATED: Changed item.id to item.itemId
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
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <h3 className="maroon-text" style={{ marginBottom: '5px' }}>Redemption QR Code</h3>
                <p className="subtitle" style={{ marginBottom: '20px' }}>Scan this single-use token at the kiosk</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                  <QRCodeSVG value={generatedQr} size={200} fgColor="#800000" level="H" />
                </div>

                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px', margin: '15px 0', fontWeight: 'bold', wordBreak: 'break-all' }}>
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
                <p className="label">Select Quantity</p>
                <div className="qty-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={18}/></button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}><Plus size={18}/></button>
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
              </div>

              <button className="modal-save-btn" disabled={!canAfford} onClick={() => addToCart(selectedItem, quantity)} style={{ width: '100%' }}>
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