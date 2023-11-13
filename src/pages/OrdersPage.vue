<template>
  <div class="q-pa-md">
    <q-table
      flat
      bordered
      title="YOR POS Report"
      :rows="orders"
      :columns="columns"
      row-key="orderId"
      v-model:pagination="pagination"
    >
      <template v-slot:top-right>
        <q-btn
          @click="printReport"
          label="Print Report"
          icon="print"
          color="primary"
        />
      </template>

      <template v-slot:pagination="scope">
        <q-btn
          v-if="scope.pagesNumber > 2"
          icon="first_page"
          color="grey-8"
          round
          dense
          flat
          :disable="scope.isFirstPage"
          @click="scope.firstPage"
        />

        <q-btn
          icon="chevron_left"
          color="grey-8"
          round
          dense
          flat
          :disable="scope.isFirstPage"
          @click="scope.prevPage"
        />

        <q-btn
          icon="chevron_right"
          color="grey-8"
          round
          dense
          flat
          :disable="scope.isLastPage"
          @click="scope.nextPage"
        />

        <q-btn
          v-if="scope.pagesNumber > 2"
          icon="last_page"
          color="grey-8"
          round
          dense
          flat
          :disable="scope.isLastPage"
          @click="scope.lastPage"
        />
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance, computed } from "vue";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default {
  setup() {
    const app = getCurrentInstance().appContext.config.globalProperties;
    const orders = ref([]);
    const app1 = initializeApp(app.$firebaseConfig);
    const db = getFirestore(app1);

    const getData = async () => {
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const q = query(collection(db, "report"));
        const querySnapshot = await getDocs(q);
        const matchingOrders = [];

        querySnapshot.docs.forEach((doc) => {
          const orderData = doc.data();

          if (
            Array.isArray(orderData.orders) &&
            orderData.orders[0].userId === currentUser.uid
          ) {
            matchingOrders.push(orderData);
          }
        });
        orders.value = matchingOrders;
      }
    };

    onMounted(() => {
      getData();
    });

    const printReport = () => {
      // Assuming orders is your data structure containing the orders array
      const ordersData = orders.value;

      // Check if ordersData is defined and not empty
      if (ordersData && ordersData.length > 0) {
        // Extracting data from nested orders array and formatting it into reportData
        const reportData = ordersData
          .map((order) => {
            if (order.orders && order.orders.length > 0) {
              return order.orders.map((innerOrder) => [
                innerOrder.orders.map((data) => [data.name]),
                innerOrder.orders.map((data) => [data.category]),
                innerOrder.orders.map((data) => [data.order_quantity]),
                innerOrder.orders.map((data) => [data.price]),
              ]);
            }
            return [];
          })
          .flat(); // Flatten the array

        const documentDefinition = {
          content: [
            { text: "YorPos Report", style: "header" },
            {
              style: "tableExample",
              table: {
                body: [
                  ["Item Name", "Item Category", "Order Quantity", "Item Price"],
                  ...reportData,
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            tableExample: {
              margin: [0, 5, 0, 15],
            },
          },
        };

        pdfMake.createPdf(documentDefinition).download("YourPosReport.pdf");
      } else {
        console.error("No orders data available");
      }
    };

    // Computed property to extract the orderId and timestamp
    const computedOrders = computed(() => {
      return orders.value.map((order) => ({
        ...order,
        orderId: order.orders[0].orderId,
        payment_status: order.orders[0].payment_status,
        timestamp: new Date(order.timestamp.seconds * 1000),
      }));
    });

    const computedTotalQuantity = computed(() => {
      let totalQuantity = 0;
      orders.value.forEach((item) => {
        item.orders.forEach((test) => {
          test.orders.forEach((order) => {
            totalQuantity = order.order_quantity;
          });
        });
      });
      return totalQuantity;
    });

    const columns = [
      {
        name: "orderId",
        required: true,
        label: "Order ID",
        align: "center",
        field: "orderId",
        sortable: true,
      },
      {
        name: "cashReceived",
        required: true,
        label: "Cash Received",
        align: "center",
        field: "cashReceived",
        sortable: true,
      },
      {
        name: "orderDate",
        required: true,
        label: "Payment Date",
        align: "center",
        field: "timestamp",
        format: (value) => value.toLocaleString(),
        sortable: true,
      },

      {
        name: "price",
        required: true,
        label: "Total Price",
        align: "center",
        field: (row) => row.cashReceived - row.change,
        sortable: true,
      },
      {
        name: "payment_status",
        required: true,
        label: "Payment Status",
        align: "center",
        field: "payment_status",
        sortable: true,
      },
    ];

    const pagination = ref({
      sortBy: "orderId",
      descending: false,
      page: 1,
      rowsPerPage: 10,
    });

    return {
      orders: computedOrders,
      columns,
      pagination,
      getData,
      computedTotalQuantity,
      printReport,
    };
  },
};
</script>
