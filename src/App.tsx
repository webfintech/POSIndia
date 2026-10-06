import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  POSNavbar, 
  ViewportMode, 
  AppTab 
} from './components/pos/POSNavbar';
import { ProductCatalog } from './components/pos/ProductCatalog';
import { ActiveCart } from './components/pos/ActiveCart';
import { CartSummary } from './components/pos/CartSummary';
import { PaymentModeSection } from './components/pos/PaymentModeSection';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { BarcodeScannerModal } from './components/pos/BarcodeScannerModal';
import { CustomerModal } from './components/pos/CustomerModal';
import { ApiLogModal } from './components/pos/ApiLogModal';
import { FlutterCodeViewer } from './components/code_viewer/FlutterCodeViewer';

import { 
  CartItem, 
  Customer, 
  PaymentMode, 
  Product, 
  SaleOrder, 
  ApiLogEntry 
} from './types/pos';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS } from './data/mockData';
import { 
  calculateCartItem, 
  calculateCartSummary, 
  formatINR 
} from './utils/taxCalculator';

export default function App() {
  // Navigation & Viewport State
  const [activeTab, setActiveTab] = useState<AppTab>('pos');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [mobilePane, setMobilePane] = useState<'catalog' | 'cart'>('catalog');

  // Multi-tenant & Network State
  const [tenantId] = useState('store_delhi_001');
  const [isOnline, setIsOnline] = useState(true);
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toISOString(),
      method: 'GET',
      endpoint: 'https://posindia.shop/api/products',
      statusCode: 200,
      durationMs: 142,
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toISOString(),
      method: 'GET',
      endpoint: 'https://posindia.shop/api/customers',
      statusCode: 200,
      durationMs: 88,
    },
  ]);

  // Catalog State
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  // Customer State
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);

  // Active Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Modals State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isApiLogsOpen, setIsApiLogsOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<SaleOrder | null>(null);

  // Computed Cart Summary with Indian GST math
  const cartSummary = useMemo(() => {
    return calculateCartSummary(cartItems);
  }, [cartItems]);

  // ---------------------------------------------------------------------------
  // CART OPERATIONS
  // ---------------------------------------------------------------------------

  const handleAddToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.productId === product.id);

      if (existingIndex !== -1) {
        const existing = prevItems[existingIndex];
        const newQty = existing.quantity + 1;
        const updatedItem = calculateCartItem(
          product,
          newQty,
          existing.discountType,
          existing.discountValue,
          existing.id
        );
        const next = [...prevItems];
        next[existingIndex] = updatedItem;
        return next;
      } else {
        const newItem = calculateCartItem(product, 1);
        return [...prevItems, newItem];
      }
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const originalProduct = products.find((p) => p.id === item.productId)!;
            return calculateCartItem(
              originalProduct,
              newQty,
              item.discountType,
              item.discountValue,
              item.id
            );
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleSetItemDiscount = (
    id: string,
    type: 'percentage' | 'fixed',
    value: number
  ) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === id) {
          const originalProduct = products.find((p) => p.id === item.productId)!;
          return calculateCartItem(originalProduct, item.quantity, type, value, item.id);
        }
        return item;
      });
    });
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('Clear all items from the active billing session?')) {
      setCartItems([]);
    }
  };

  // ---------------------------------------------------------------------------
  // BARCODE SCANNING TO CART
  // ---------------------------------------------------------------------------

  const handleBarcodeScanned = (barcode: string) => {
    const cleanBarcode = barcode.trim();
    const product = products.find(
      (p) =>
        p.barcode === cleanBarcode ||
        p.sku.toLowerCase() === cleanBarcode.toLowerCase()
    );

    if (product) {
      handleAddToCart(product);
    } else {
      alert(`Barcode ${cleanBarcode} not found in catalog.`);
    }
  };

  // ---------------------------------------------------------------------------
  // CHECKOUT & REST API SYNC
  // ---------------------------------------------------------------------------

  const handleCheckout = async (paymentDetails: {
    cashTendered?: number;
    cashChange?: number;
    upiRefId?: string;
    cardLast4?: string;
    cardAuthCode?: string;
    creditRemarks?: string;
  }) => {
    if (cartItems.length === 0) return;

    setIsProcessingCheckout(true);

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    const newOrder: SaleOrder = {
      invoiceNumber,
      tenantId,
      storeName: 'POSIndia Retail Hub',
      cashierName: 'Harish Patel',
      customer: selectedCustomer,
      items: [...cartItems],
      summary: cartSummary,
      paymentMode,
      paymentDetails,
      createdAt: new Date().toISOString(),
      status: isOnline ? 'COMPLETED' : 'PENDING_SYNC',
    };

    // Simulate Network Latency to https://posindia.shop/api/sales/create
    const latency = isOnline ? Math.floor(180 + Math.random() * 120) : 20;

    setTimeout(() => {
      // Record API Log
      const logEntry: ApiLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        method: 'POST',
        endpoint: 'https://posindia.shop/api/sales/create',
        statusCode: isOnline ? 201 : 200,
        requestPayload: newOrder,
        responsePayload: {
          success: true,
          invoiceNumber,
          syncStatus: isOnline ? 'SYNCHRONIZED' : 'LOCAL_CACHED',
        },
        durationMs: latency,
      };

      setApiLogs((prev) => [logEntry, ...prev]);
      setIsProcessingCheckout(false);
      setConfirmedOrder(newOrder);

      // Trigger Confetti Effect
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.65 },
        });
      } catch (_) {}

      // Update customer outstanding balance if sale was on Credit
      if (paymentMode === 'CREDIT' && !selectedCustomer.isWalkIn) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === selectedCustomer.id
              ? {
                  ...c,
                  currentOutstanding: c.currentOutstanding + cartSummary.grandTotal,
                }
              : c
          )
        );
      }
    }, latency);
  };

  const handleStartNewBill = () => {
    setConfirmedOrder(null);
    setCartItems([]);
    setSelectedCustomer(customers[0]);
    setPaymentMode('CASH');
    setMobilePane('catalog');
  };

  // ---------------------------------------------------------------------------
  // RENDER APP CONTENT
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <POSNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        viewportMode={viewportMode}
        onViewportChange={setViewportMode}
        tenantId={tenantId}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        onOpenBarcodeScanner={() => setIsScannerOpen(true)}
        onOpenApiLogs={() => setIsApiLogsOpen(true)}
        cartItemCount={cartSummary.itemCount}
      />

      {/* Main Body */}
      {activeTab === 'flutter_code' ? (
        <FlutterCodeViewer />
      ) : (
        /* POS Interactive Terminal Simulator */
        <main className="flex-1 flex justify-center items-stretch overflow-hidden p-0 sm:p-2 bg-slate-950">
          <div
            className={`flex-1 flex flex-col bg-slate-900 overflow-hidden shadow-2xl transition-all duration-300 ${
              viewportMode === 'tablet'
                ? 'max-w-[1024px] border border-slate-800 rounded-xl my-2'
                : viewportMode === 'mobile'
                ? 'max-w-[420px] border border-slate-800 rounded-2xl my-2 ring-8 ring-slate-900/50'
                : 'w-full'
            }`}
          >
            {/* Viewport Frame Header on Tablet / Mobile Emulation */}
            {viewportMode !== 'desktop' && (
              <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>
                  {viewportMode === 'tablet' ? 'iPad Pro (1024px)' : 'Handheld POS (390px)'}
                </span>
                <span className="text-emerald-400 font-semibold">
                  posindia.shop • Active Session
                </span>
              </div>
            )}

            {/* Responsive Layout Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* DESKTOP & TABLET: Split Pane (Catalog 58%, Cart 42%) */}
              {viewportMode !== 'mobile' ? (
                <>
                  <div className="w-full md:w-[58%] h-full overflow-hidden">
                    <ProductCatalog
                      products={products}
                      onAddToCart={handleAddToCart}
                      onOpenScanner={() => setIsScannerOpen(true)}
                    />
                  </div>

                  <div className="w-full md:w-[42%] h-full flex flex-col border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950 overflow-hidden">
                    {/* Active Cart Items */}
                    <div className="flex-1 overflow-hidden">
                      <ActiveCart
                        cartItems={cartItems}
                        customer={selectedCustomer}
                        onUpdateQuantity={handleUpdateQuantity}
                        onSetItemDiscount={handleSetItemDiscount}
                        onRemoveItem={handleRemoveItem}
                        onClearCart={handleClearCart}
                        onOpenCustomerSelector={() => setIsCustomerModalOpen(true)}
                        grandTotal={cartSummary.grandTotal}
                      />
                    </div>

                    {/* Tax & GST Summary */}
                    <CartSummary summary={cartSummary} />

                    {/* Payment Modes & Checkout */}
                    <PaymentModeSection
                      paymentMode={paymentMode}
                      onSelectPaymentMode={setPaymentMode}
                      grandTotal={cartSummary.grandTotal}
                      customer={selectedCustomer}
                      onCheckout={handleCheckout}
                      isProcessing={isProcessingCheckout}
                      disabled={cartItems.length === 0}
                    />
                  </div>
                </>
              ) : (
                /* MOBILE VIEWPORT: Stacked Tabs with Floating Navigation */
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Mobile Tab View Content */}
                  <div className="flex-1 overflow-hidden">
                    {mobilePane === 'catalog' ? (
                      <ProductCatalog
                        products={products}
                        onAddToCart={handleAddToCart}
                        onOpenScanner={() => setIsScannerOpen(true)}
                      />
                    ) : (
                      <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
                        <div className="flex-1 overflow-hidden">
                          <ActiveCart
                            cartItems={cartItems}
                            customer={selectedCustomer}
                            onUpdateQuantity={handleUpdateQuantity}
                            onSetItemDiscount={handleSetItemDiscount}
                            onRemoveItem={handleRemoveItem}
                            onClearCart={handleClearCart}
                            onOpenCustomerSelector={() => setIsCustomerModalOpen(true)}
                            grandTotal={cartSummary.grandTotal}
                          />
                        </div>

                        <CartSummary summary={cartSummary} />

                        <PaymentModeSection
                          paymentMode={paymentMode}
                          onSelectPaymentMode={setPaymentMode}
                          grandTotal={cartSummary.grandTotal}
                          customer={selectedCustomer}
                          onCheckout={handleCheckout}
                          isProcessing={isProcessingCheckout}
                          disabled={cartItems.length === 0}
                        />
                      </div>
                    )}
                  </div>

                  {/* Mobile Bottom Navigation Bar */}
                  <div className="bg-slate-950 border-t border-slate-800 grid grid-cols-2 p-1 gap-1">
                    <button
                      onClick={() => setMobilePane('catalog')}
                      className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        mobilePane === 'catalog'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Store Catalog</span>
                    </button>
                    <button
                      onClick={() => setMobilePane('cart')}
                      className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        mobilePane === 'cart'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Cart</span>
                      {cartSummary.itemCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-emerald-400 text-slate-950 rounded-full font-bold text-[10px]">
                          {cartSummary.itemCount} ({formatINR(cartSummary.grandTotal)})
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* MODALS */}
      {/* 1. Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        products={products}
      />

      {/* 2. Customer Attachment Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        selectedCustomerId={selectedCustomer.id}
        onSelectCustomer={setSelectedCustomer}
        onAddNewCustomer={(newCust) => setCustomers((prev) => [...prev, newCust])}
      />

      {/* 3. REST API Log Inspector */}
      <ApiLogModal
        isOpen={isApiLogsOpen}
        onClose={() => setIsApiLogsOpen(false)}
        logs={apiLogs}
        onClearLogs={() => setApiLogs([])}
      />

      {/* 4. ESC/POS Receipt Confirmation Modal */}
      <ReceiptModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onStartNewBill={handleStartNewBill}
      />
    </div>
  );
}
