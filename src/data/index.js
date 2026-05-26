export const MENU_ITEMS = [
  { id: 1, name: "Jollof Rice", category: "Mains", price: 45, popular: true, emoji: "", description: "Classic Ghanaian jollof with grilled chicken", modifiers: ["Extra Spicy", "No Onions", "Extra Sauce"] },
  { id: 2, name: "Grilled Tilapia", category: "Mains", price: 65, popular: true, emoji: "", description: "Served with banku and pepper sauce", modifiers: ["Extra Pepper", "No Pepper", "With Shito"] },
  { id: 3, name: "Banku & Tilapia", category: "Mains", price: 60, popular: false, emoji: "", description: "Traditional banku with grilled tilapia", modifiers: ["Extra Banku", "Extra Fish", "With Shito"] },
  { id: 4, name: "Waakye", category: "Mains", price: 35, popular: false, emoji: "", description: "Rice and beans with wele, fried fish, egg", modifiers: ["Extra Wele", "No Egg", "With Spaghetti"] },
  { id: 5, name: "Chicken Light Soup", category: "Mains", price: 40, popular: false, emoji: "", description: "Spiced tomato broth with tender chicken", modifiers: ["Extra Spicy", "Extra Chicken", "No Pepper"] },
  { id: 6, name: "Kelewele", category: "Sides", price: 20, popular: true, emoji: "", description: "Spicy fried plantain with peanuts", modifiers: ["Spicy", "Extra Spicy", "With Shito"] },
  { id: 7, name: "Sobolo", category: "Drinks", price: 15, popular: false, emoji: "", description: "Hibiscus flower drink, chilled", modifiers: ["Extra Sweet", "Less Sugar", "With Ginger"] },
  { id: 8, name: "Fresh Juice", category: "Drinks", price: 20, popular: false, emoji: "", description: "Freshly squeezed seasonal fruit juice", modifiers: ["Orange", "Pineapple", "Mixed"] },
  { id: 9, name: "Water", category: "Drinks", price: 5, popular: false, emoji: "", description: "Bottled still water", modifiers: [] },
  { id: 10, name: "Fufu & Soup", category: "Mains", price: 50, popular: false, emoji: "", description: "Pounded fufu with light or palm nut soup", modifiers: ["Light Soup", "Palm Nut Soup", "Extra Fufu"] },
  { id: 11, name: "Fried Rice", category: "Mains", price: 40, popular: false, emoji: "", description: "Egg fried rice with vegetables and chicken", modifiers: ["Extra Chicken", "Vegetarian", "Extra Spicy"] },
  { id: 12, name: "Chin Chin", category: "Desserts", price: 10, popular: false, emoji: "", description: "Crunchy fried dough snack", modifiers: [] },
];

export const CATEGORIES = ["All", "Popular", "Mains", "Sides", "Drinks", "Desserts"];

export const TABLES = [
  { id: 1, number: "Table 01", status: "available", seats: 2 },
  { id: 2, number: "Table 02", status: "occupied", seats: 4 },
  { id: 3, number: "Table 03", status: "available", seats: 2 },
  { id: 4, number: "Table 04", status: "occupied", seats: 6 },
  { id: 5, number: "Table 05", status: "available", seats: 4 },
  { id: 6, number: "Table 06", status: "available", seats: 2 },
  { id: 7, number: "Table 07", status: "reserved", seats: 4 },
  { id: 8, number: "Table 08", status: "occupied", seats: 8 },
  { id: 9, number: "Table 09", status: "available", seats: 2 },
  { id: 10, number: "Table 10", status: "available", seats: 4 },
  { id: 11, number: "Table 11", status: "occupied", seats: 6 },
  { id: 12, number: "Table 12", status: "available", seats: 2 },
];

export const INITIAL_KDS_ORDERS = [
  {
    id: 1023, status: "new", table: "Table 12", type: "Dine In",
    placedAt: Date.now() - 2 * 60000,
    items: [{ name: "Jollof Rice", qty: 1, note: "Extra spicy" }, { name: "Grilled Chicken", qty: 1 }, { name: "Waakye", qty: 1 }],
    targetMins: 12,
  },
  {
    id: 1024, status: "new", table: "Takeaway", type: "Takeaway",
    placedAt: Date.now() - 3 * 60000,
    items: [{ name: "Banku", qty: 2 }, { name: "Tilapia", qty: 1, note: "No pepper" }],
    targetMins: 10,
  },
  {
    id: 1020, status: "preparing", table: "Table 05", type: "Dine In",
    placedAt: Date.now() - 6 * 60000,
    items: [{ name: "Jollof Rice", qty: 2 }, { name: "Sobolo", qty: 2 }, { name: "Kelewele", qty: 1 }],
    targetMins: 12,
  },
  {
    id: 1021, status: "preparing", table: "Table 03", type: "Dine In",
    placedAt: Date.now() - 4 * 60000,
    items: [{ name: "Waakye", qty: 2 }, { name: "Fresh Juice", qty: 2 }],
    targetMins: 10,
  },
  {
    id: 1017, status: "ready", table: "Table 01", type: "Dine In",
    placedAt: Date.now() - 14 * 60000,
    items: [{ name: "Grilled Tilapia", qty: 1 }, { name: "Banku", qty: 2 }],
    targetMins: 12,
  },
  {
    id: 1018, status: "ready", table: "Table 02", type: "Takeaway",
    placedAt: Date.now() - 11 * 60000,
    items: [{ name: "Jollof Rice", qty: 3 }, { name: "Sobolo", qty: 3 }, { name: "Kelewele", qty: 2 }],
    targetMins: 10,
  },
];

export const ORDER_HISTORY = [
  { id: 1010, table: "Table 04", type: "Dine In", items: ["Jollof Rice x2", "Sobolo x2"], total: 120, payment: "Paid", syncStatus: "Synced", serviceTime: 11, placedAt: "12:15 PM", servedAt: "12:26 PM" },
  { id: 1011, table: "Takeaway", type: "Takeaway", items: ["Grilled Tilapia x1", "Water x1"], total: 70, payment: "Paid", syncStatus: "Synced", serviceTime: 8, placedAt: "12:20 PM", servedAt: "12:28 PM" },
  { id: 1012, table: "Table 08", type: "Dine In", items: ["Waakye x3", "Fresh Juice x3"], total: 165, payment: "Paid", syncStatus: "Synced", serviceTime: 14, placedAt: "12:05 PM", servedAt: "12:19 PM" },
  { id: 1013, table: "Table 02", type: "Dine In", items: ["Banku & Tilapia x2", "Kelewele x1"], total: 140, payment: "Pending", syncStatus: "Synced", serviceTime: 16, placedAt: "11:50 AM", servedAt: "12:06 PM" },
  { id: 1014, table: "Takeaway", type: "Takeaway", items: ["Chicken Light Soup x2", "Jollof Rice x2"], total: 170, payment: "Paid", syncStatus: "Pending Sync", serviceTime: null, placedAt: "12:30 PM", servedAt: null },
];
