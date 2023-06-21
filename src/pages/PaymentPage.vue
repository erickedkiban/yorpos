<template>
  <q-page class="q-ma-lg" style="min-height: 0 !important">
    <div>
      <div class="row">
        <div class="col-8">
          <div v-for="orderId in Object.keys(segregatedOrders)" :key="orderId">
            <div class="text-h5 text-weight-light text-uppercase q-mb-sm">
              order #: {{ orderId }}
            </div>
            <div class="flex justify-end">
              <q-checkbox style="position: relative; top: -10px;" v-model="selectedTables" :val="orderId" dense />
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
                style="background: #8bb5be; width: 100%"
                class="text-uppercase text-h5"
              >
                Pay Now
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
    const selectedTables = ref([]);
    const cashReceived = ref(null);
    const uuid = ref("");
    const orders = ref([]);
    const app = getCurrentInstance().appContext.config.globalProperties;
    const app1 = initializeApp(app.$firebaseConfig);
    const db = getFirestore(app1);

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

    watch(selectedTables, (newValue) => {
      if (newValue.length === 0) {
        cashReceived.value = null;
      }
    });

    onMounted(getData);

    return {
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
