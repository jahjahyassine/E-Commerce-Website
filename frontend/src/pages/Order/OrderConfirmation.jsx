import { useEffect, useMemo, useState } from "react";
import DotField from "../../components/animation/DotField";
import Navbar from "../../components/Navbar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PackageCheck, MailCheck, PackageSearch, ShoppingBag } from "lucide-react";
import getCurrentUser from "../../hooks/CurrentUser";

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const {
    data: order,
    isLoading: orderLoading,
    isError,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id && !!user,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }

    if (!userLoading && !user) {
      navigate("/login");
    }
  }, [user, userLoading, navigate]);

  const shippingCost = 10;

  const subtotal = useMemo(() => {
    if (!order?.items) return 0;

    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [order]);

  const total = subtotal + shippingCost;

  if (userLoading || orderLoading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-muted">Loading order...</div>
        </div>
      </>
    );
  }

  if (isError || !order) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-danger">
            Unable to load your order.
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <DotField
          gradientFrom="#A8AEC040"
          gradientTo="#6FA7A330"
          glowColor="#6FA7A320"
        />
      </div>

      <section className="relative z-10 w-[70vw] mx-auto pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Order Complete
          </h1>

          <p className="text-muted">
            Thank you for your purchase.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-inverse">
              <Check size={16} />
            </div>

            <span className="text-foreground">
              Cart
            </span>
          </div>

          <div className="w-12 h-px bg-border-soft" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-inverse">
              <Check size={16} />
            </div>

            <span className="text-foreground">
              Checkout
            </span>
          </div>

          <div className="w-12 h-px bg-border-soft" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-background-dark flex items-center justify-center text-foreground">
              3
            </div>

            <span className="text-foreground">
              Confirmation
            </span>
          </div>
        </div>

        {/* Success */}
        <div className="bg-card-dark/80 border border-border-soft rounded-3xl p-8 shadow-elevated backdrop-blur-xl mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mb-5">
              <PackageCheck
                size={34}
                className="text-accent"
              />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              Order Confirmed!
            </h2>

            <p className="text-muted mb-4">
              Your order has been successfully placed.
            </p>

            <div className="px-4 py-2 rounded-lg bg-card-dark border border-border-soft">
              <span className="text-subtle mr-2">
                Order ID:
              </span>

              <span className="text-highlight font-semibold">
                #{order.id}
              </span>
            </div>

            <p className="text-subtle text-sm mt-4">
              A confirmation email has been sent to{" "}
              <span className="text-foreground">
                {user?.email}
              </span>
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 bg-card-dark/80 border border-border-soft rounded-3xl p-6 shadow-elevated backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag
                size={20}
                className="text-accent"
              />

              <h3 className="text-lg font-semibold text-foreground">
                Order Summary
              </h3>
            </div>

            <div className="space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border-soft hover:bg-card-hover transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-surface flex items-center justify-center overflow-hidden">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag
                          size={22}
                          className="text-subtle"
                        />
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground">
                        {item.product?.name}
                      </h4>

                      <p className="text-sm text-subtle">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-highlight font-bold">
                      {(item.price * item.quantity).toFixed(2)} DH
                    </p>

                    <p className="text-sm text-subtle">
                      {item.price.toFixed(2)} DH each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-card-dark/80 border border-border-soft rounded-3xl p-6 shadow-elevated backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Price Breakdown
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted">
                  Subtotal
                </span>

                <span className="text-foreground">
                  {subtotal.toFixed(2)} DH
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">
                  Shipping
                </span>

                <span className="text-foreground">
                  {shippingCost.toFixed(2)} DH
                </span>
              </div>

              <div className="h-px bg-border-soft" />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">
                  Total
                </span>

                <span className="text-xl text-highlight font-bold">
                  {total.toFixed(2)} DH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Shipping */}
          <div className="bg-card-dark/80 border border-border-soft rounded-3xl p-6 shadow-elevated backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-5">
              <MapPin
                size={20}
                className="text-accent"
              />

              <h3 className="font-semibold text-foreground">
                Shipping Address
              </h3>
            </div>

            <div className="text-muted space-y-1">
              <p>{order.shipping_address}</p>

              <p>
                {order.shipping_address?.address}
              </p>

              <p>
                {order.shipping_address?.city}
              </p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-card-dark/80 border border-border-soft rounded-3xl p-6 shadow-elevated backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-5">
              <CreditCard
                size={20}
                className="text-accent"
              />

              <h3 className="font-semibold text-foreground">
                Payment Information
              </h3>
            </div>

            <div className="space-y-2 text-muted">
              <div className="flex justify-between">
                <span>Payment method</span>

                <span className="text-foreground">
                  {order.payment_method}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Status</span>

                <span className="text-success">
                  Paid
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="mt-6 bg-card-dark/80 border border-border-soft rounded-3xl p-6 shadow-elevated backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <Truck
              size={20}
              className="text-accent"
            />

            <h3 className="font-semibold text-foreground">
              Delivery
            </h3>
          </div>

          <p className="text-muted">
            Your order will be prepared and shipped soon.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-inverse font-semibold transition-colors"
          >
            Continue Shopping
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-3 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground font-semibold transition-colors"
          >
            View My Orders
          </button>
        </div>
      </section>
    </div>
  );
};

export default OrderConfirmation;