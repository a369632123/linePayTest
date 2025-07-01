const orders = {
    1: {
      amount: 100,
      currency: "TWD",
      orderId: "EXAMPLE_ORDER_20230422_1000001",
      packages: [
        {
          id: "1",
          amount: 100,
          products: [
            {
              id: "PEN-B-001",
              name: "測試餐",
              quantity: 2,
              price: 50,
            },
          ],
        },
      ],
      redirectUrls: {
        confirmUrl: "https://store.example.com/order/payment/authorize",
        cancelUrl: "https://store.example.com/order/payment/cancel",
      }
    },
    2: {
        amount: 2,
        currency: "TWD",
        orderId: "EXAMPLE_ORDER_20230422_1000002",
        packages: [
            {
            id: "2",
            amount: 2,
            products: [
                {
                id: "NOTEBOOK-B-001",
                name: "Notebook Brown",
                quantity: 1,
                price: 200,
                },
            ],
            },
        ],
        redirectUrls: {
            confirmUrl: "https://store.example.com/order/payment/authorize",
            cancelUrl: "https://store.example.com/order/payment/cancel",
        }
    }
};

module.exports = orders;