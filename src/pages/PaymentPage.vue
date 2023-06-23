<template>
  <div class="row">
    <div class="col-8"></div>
    <div class="col-4">
      <q-separator
        vertical
        style="color: #d8dbd9; height: 100vh; position: fixed;"
      />
    </div>
  </div>
  <q-page class="q-ma-lg" style="min-height: 0 !important">
    <div>
      <div class="row">
        <div class="col-8" v-if="orders.length === 0">
          <q-banner inline-actions class="text-white bg-red">
            No order found.
          </q-banner>
        </div>
        <div v-else class="col-8">
          <div v-for="orderId in Object.keys(segregatedOrders)" :key="orderId">
            <div class="text-h5 text-weight-light text-uppercase q-mb-sm">
              order #: {{ orderId }}
            </div>
            <div class="flex justify-end">
              <q-checkbox
                style="position: relative; top: -10px"
                v-model="selectedTables"
                :val="orderId"
                dense
              />
            </div>
            <q-separator style="color: #d8dbd9" />
            <q-table
              grid
              grid-header
              flat
              bordered
              :rows="segregatedOrders[orderId]"
              :columns="columns"
              row-key="name"
              hide-header
              :pagination.sync="pagination"
            >
              <template v-slot:bottom>
                <div class="q-pt-lg q-pb-lg" style="width: 100%">
                  <q-btn
                    push
                    class="text-uppercase text-black text-weight-light full-width text-h6"
                    color="red"
                    label="Cancel Order"
                    @click="cancelOrder(orderId)"
                  />
                </div>
              </template>
            </q-table>
          </div>
        </div>

        <div class="col-4">
          <div class="q-pl-xl">
            <div class="text-h5 text-weight-light text-uppercase">
              Payable Amount
            </div>
            <div
              class="text-h5 text-weight-light text-uppercase q-mb-md"
              style="color: #d89f65"
            >
              P{{ totalPrice }}
            </div>
            <q-separator style="color: #d8dbd9" />
            <div class="flex justify-between q-mt-lg">
              <!-- Remaining code omitted for brevity -->
            </div>
            <div>
              <q-card class="q-mt-lg" style="background: #eaf0f0">
                <q-card-section>
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="text-subtitle2 text-uppercase">
                        Add Cash Received
                      </div>
                    </div>
                    <div>
                      <q-input
                        :input-style="{ fontSize: '20px' }"
                        v-model="cashReceived"
                        :dense="dense"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="q-pt-md q-pb-md">
              <div
                class="text-subtitle1 text-uppercase text-weight-medium flex justify-between"
              >
                <div>Subtotal</div>
                <div>P{{ totalPrice }}</div>
              </div>
              <div
                class="text-subtitle1 text-uppercase text-weight-medium flex justify-between"
              >
                <div>Change</div>
                <div v-if="cashReceived > totalPrice">
                  P{{ cashReceived - totalPrice }}
                </div>
                <div v-else>P0</div>
              </div>
              <div
                class="text-subtitle1 text-uppercase text-weight-medium flex justify-between"
              >
                <div>
                  Service Charge
                  <span class="text-weight-light q-ml-sm">0%</span>
                </div>
                <div>0</div>
              </div>
            </div>
            <q-separator class="q-mb-xl" style="color: #d8dbd9" />
            <div
              class="flex justify-between text-uppercase text-weight-light text-h5"
            >
              <div>Total</div>
              <div>P{{ totalPrice }}</div>
            </div>
            <div class="q-mt-xl">
              <q-btn
                v-if="!cashReceived || cashReceived < totalPrice"
                disabled
                style="background: #8bb5be; width: 100%"
                class="text-uppercase text-h5"
                >Pay Now</q-btn
              >
              <q-btn
                v-else
                @click="paynow"
                style="background: #8bb5be; width: 100%"
                class="text-uppercase text-h5"
                :disable="loading"
              >
                <span v-if="!loading">Pay Now</span>
                <q-spinner-hourglass v-else color="white" />
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, getCurrentInstance, onMounted, computed, watch } from "vue";
import { useQuasar, Notify } from "quasar";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";

const columns = [
  {
    name: "item",
    required: true,
    label: "ITEM",
    align: "left",
    field: (row) => row.name,
    sortable: true,
  },
  {
    name: "price",
    align: "center",
    label: "PRICE",
    field: (row) => row.price,
    sortable: true,
  },
  {
    name: "qty",
    label: "QTY",
    field: (row) => row.order_quantity,
    sortable: true,
  },
];

export default {
  setup() {
    const loading = ref(false);
    const $q = useQuasar();
    const selectedTables = ref([]);
    const cashReceived = ref(null);
    const uuid = ref("");
    const orders = ref([]);
    const app = getCurrentInstance().appContext.config.globalProperties;
    const app1 = initializeApp(app.$firebaseConfig);
    const db = getFirestore(app1);

    const pagination = ref({
      sortBy: "desc",
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 5,
    });

    const selectedOrders = computed(() => {
      const selected = [];
      for (const orderId of selectedTables.value) {
        if (segregatedOrders.value.hasOwnProperty(orderId)) {
          selected.push(...segregatedOrders.value[orderId]);
        }
      }
      return selected;
    });

    const totalPrice = computed(() => {
      return selectedOrders.value.reduce(
        (total, item) => total + item.total,
        0
      );
    });

    const segregatedOrders = computed(() => {
      const segregated = {};

      orders.value.forEach((order) => {
        const orderId = order.orderId;

        if (!segregated[orderId]) {
          segregated[orderId] = [];
        }
        const items = order.orders.map((item) => {
          const total = item.price * item.order_quantity;
          return { ...item, total };
        });
        segregated[orderId].push(...items);
      });

      return segregated;
    });

    async function getData() {
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const q = query(collection(db, "orders"));
        const querySnapshot = await getDocs(q);
        const matchingOrders = [];

        querySnapshot.docs.forEach((doc) => {
          const orderData = doc.data();

          if (
            Array.isArray(orderData.orders) &&
            orderData.orders.length > 0 &&
            orderData.userId === currentUser.uid &&
            orderData.payment_status === "unpaid"
          ) {
            matchingOrders.push(orderData);
          }
        });

        orders.value = matchingOrders;
      }
    }

    async function cancelOrder(orderId) {
      const orderQuery = query(
        collection(db, "orders"),
        where("orderId", "==", orderId)
      );
      const querySnapshot = await getDocs(orderQuery);

      querySnapshot.forEach(async (doc) => {
        // Delete the order document
        await deleteDoc(doc.ref);
      });

      // Remove the order from the orders array
      orders.value = orders.value.filter((order) => order.orderId !== orderId);
    }

    async function paynow() {
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const selectedOrderIds = selectedTables.value;
        const matchingOrders = orders.value.filter((order) =>
          selectedOrderIds.includes(order.orderId)
        );

        console.log("Selected Order IDs:", selectedOrderIds);
        console.log("Matching Orders:", matchingOrders);

        if (matchingOrders.length > 0) {
          const totalCashReceived = cashReceived.value;
          const totalAmount = totalPrice.value;
          const change = totalCashReceived - totalAmount;

          try {
            loading.value = true;
            // Update the payment status of the orders to "paid"
            for (const orderId of selectedOrderIds) {
              const orderQuery = query(
                collection(db, "orders"),
                where("orderId", "==", orderId)
              );
              const querySnapshot = await getDocs(orderQuery);

              querySnapshot.forEach(async (doc) => {
                const orderDocRef = doc.ref;
                console.log("Order Doc Ref:", orderDocRef);
                await updateDoc(orderDocRef, {
                  payment_status: "paid",
                });
              });
            }

            // Update the payment status in the report collection
            const reportData = {
              orders: matchingOrders.map((order) => {
                return {
                  ...order,
                  payment_status: "paid",
                };
              }),
              cashReceived: totalCashReceived,
              change: change > 0 ? change : 0,
              timestamp: Timestamp.now(),
            };

            const reportsCollectionRef = collection(db, "report");
            await addDoc(reportsCollectionRef, reportData);

            // Clear the selected tables and cash received
            selectedTables.value = [];
            cashReceived.value = null;

            // Refresh the orders data
            setTimeout(() => {
              loading.value = false;
              $q.notify({
                message: "Payment successful!",
                position: "top",
                timeout: 2000,
              });
            }, 500);
            await getData();
          } catch (error) {
            console.error("Error while processing payment:", error);
            // Handle error scenarios.
            loading.value = false;
          }
        }
      }
    }

    watch(selectedTables, (newValue) => {
      if (newValue.length === 0) {
        cashReceived.value = null;
      }
    });

    onMounted(getData);

    return {
      pagination,
      loading,
      paynow,
      selectedTables,
      cashReceived,
      uuid,
      orders,
      columns,
      selectedOrders,
      totalPrice,
      segregatedOrders,
      cancelOrder,
      dense: ref(false),
    };
  },
};
</script>

<style>
/* Your custom styles here */
</style>
