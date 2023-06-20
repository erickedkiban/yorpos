<template>
  <q-page class="q-ma-lg" style="min-height: 0 !important">
    <div>
      <div class="text-h4 text-weight-light text-uppercase q-mb-md">
        order #: 12564878
      </div>
      <q-separator style="color: #d8dbd9" />
      <div class="row">
        <div class="q-mt-md col-8">
          <q-table
            grid
            grid-header
            flat
            bordered
            :rows="rows"
            :columns="columns"
            row-key="name"
            hide-header
          >
          </q-table>
          <q-btn
            push
            class="text-uppercase text-weight-light full-width text-h6"
            color="red"
            label="Cancel Order"
          />
        </div>
        <div class="q-mt-md col-4"></div>
      </div>
    </div>
  </q-page>
</template>
<script>
import { ref, getCurrentInstance, onMounted } from "vue";
import { initializeApp, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
    field: "price",
    sortable: true,
  },
  { name: "qty", label: "QTY", field: "qty", sortable: true },
  { name: "subtotal", label: "SUBTOTAL", field: "subtotal" },
];

const rows = [
  {
    name: "Frozen Yogurt",
    price: 159,
    qty: 6.0,
    subtotal: 24,
  },
  {
    name: "Frozen Yogurt",
    price: 159,
    qty: 6.0,
    subtotal: 24,
  },
  {
    name: "Frozen Yogurt",
    price: 159,
    qty: 6.0,
    subtotal: 24,
  },
  {
    name: "Frozen Yogurt",
    price: 159,
    qty: 6.0,
    subtotal: 24,
  },
  {
    name: "Frozen Yogurt",
    price: 159,
    qty: 6.0,
    subtotal: 24,
  },
];

export default {
  setup() {
    const uuid = ref("");
    const orders = ref([]);
    const app = getCurrentInstance().appContext.config.globalProperties;
    const app1 = initializeApp(app.$firebaseConfig);
    const db = getFirestore(app1);

    // async function getData() {
    //   const querySnapshot = await getDocs(collection(db, "orders"));
    //   querySnapshot.forEach((doc) => {
    //     // doc.data() is never undefined for query doc snapshots
    //     console.log(doc.id, " => ", doc.data());
    //   });
    // }

    async function getData() {
      // Get the current user ID
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const q = query(collection(db, "orders"));
        console.log("currentUser.uid", currentUser.uid);

        const querySnapshot = await getDocs(q);
        querySnapshot.docs.forEach((doc) => {
          // Access the document data using doc.data()
          const orderData = doc.data();

          if (Array.isArray(orderData.orders) && orderData.orders.length > 0) {
            const matchingOrder = orderData.orders.find(
              (order) => order.userid === currentUser.uid
            );

            if (matchingOrder) {
              console.log("Matching Order:", matchingOrder);
            }
            else {
              console.log("No matching Order:", currentUser.uid)
            }
          }
        });
      }
    }

    onMounted(() => {
      getData();
    });

    return {
      getData,
      uuid,
      columns,
      rows,
    };
  },
};
</script>
