import { Container } from '@/components/Container'
import { em } from '@/event-model/event-model'

// These are our custom command definitions
const cmd = {
  AddItem: {
    name: 'AddItem',
  },
  RemoveItem: {
    name: 'RemoveItem',
  },
  Checkout: {
    name: 'Checkout',
  },
}

// These are our custom event definitions
const evt = {
  ItemAdded: {
    name: 'ItemAdded',
  },
  ItemRemoved: {
    name: 'ItemRemoved',
  },
  CheckoutCompleted: {
    name: 'CheckoutCompleted',
  },
}

// These are our readModel definitions
const rm = {
  CartItems: {
    name: 'CartItems',
  },
  OrderHistory: {
    name: 'OrderHistory',
  },
}

const EmptyCartView = () => (
  <div className="w-32 rounded border bg-white p-3">
    <div className="mb-2 text-xs font-bold">🛒 Shopping Cart</div>
    <div className="text-xs text-gray-500">Empty cart</div>
    <button className="mt-2 w-full rounded bg-blue-500 px-2 py-1 text-xs text-white">
      Add Item
    </button>
  </div>
)

const CartWithItemsView = () => (
  <div className="w-32 rounded border bg-white p-3">
    <div className="mb-2 text-xs font-bold">🛒 Shopping Cart</div>
    <div className="mb-2 space-y-1">
      <div className="flex justify-between rounded bg-gray-100 p-1 text-xs">
        <span>Apple</span>
        <span>$1.99</span>
      </div>
    </div>
    <div className="border-t pt-1 text-xs font-bold">Total: $1.99</div>
    <div className="mt-2 space-y-1">
      <button className="w-full rounded bg-red-500 px-2 py-1 text-xs text-white">
        Remove Item
      </button>
      <button className="w-full rounded bg-green-500 px-2 py-1 text-xs text-white">
        Checkout
      </button>
    </div>
  </div>
)

const OrderCompleteView = () => (
  <div className="w-32 rounded border bg-white p-3">
    <div className="mb-2 text-xs font-bold">✅ Order Complete</div>
    <div className="text-xs text-gray-500">Thank you for your purchase!</div>
    <div className="mt-2 text-xs text-green-600">Order #12345</div>
    <button className="mt-2 w-full rounded bg-blue-500 px-2 py-1 text-xs text-white">
      New Order
    </button>
  </div>
)

// Define our states
const emptyCart = em.view(rm.CartItems, <EmptyCartView />)
const cartWithItems = em.view(rm.CartItems, <CartWithItemsView />)
const orderComplete = em.view(rm.OrderHistory, <OrderCompleteView />)

// Define transitions between states
const addItemTransition = em.transition(
  emptyCart,
  em.command(cmd.AddItem),
  em.event(evt.ItemAdded),
  cartWithItems,
  'addItem',
)

const removeItemTransition = em.transition(
  cartWithItems,
  em.command(cmd.RemoveItem),
  em.event(evt.ItemRemoved),
  emptyCart,
  'removeItem',
)

const checkoutTransition = em.transition(
  cartWithItems,
  em.command(cmd.Checkout),
  em.event(evt.CheckoutCompleted),
  orderComplete,
  'checkout',
)

// Create a complete model with all transitions
const shoppingCartModel = em.flow(
  [addItemTransition, removeItemTransition, checkoutTransition],
  emptyCart,
)

export default function EventModel2Test() {
  return (
    <Container>
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">
          Event Model 2: Transition-Based Approach
        </h1>
        <p className="mb-4 text-gray-600">
          This demonstrates the new transition-based event modeling approach
          where states are explicitly defined and transitions between them are
          clearly specified.
        </p>
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-bold">
            Key Differences from Event Model 1:
          </h3>
          <ul className="ml-6 list-disc space-y-1 text-sm">
            <li>
              <strong>States:</strong> Explicit state definitions (stateless
              views or views with read models)
            </li>
            <li>
              <strong>Transitions:</strong> Clear from-state → command → event →
              to-state relationships
            </li>
            <li>
              <strong>Models:</strong> Collections of transitions that define
              the complete system behavior
            </li>
            <li>
              <strong>Visualization:</strong> Shows states as nodes and
              transitions as labeled arrows
            </li>
          </ul>
        </div>
      </div>

      {em.render(shoppingCartModel)}
    </Container>
  )
}
