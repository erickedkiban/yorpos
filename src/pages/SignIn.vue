<template>
  <div>
    <div class="q-pa-lg row justify-center q-mt-lg">
      <q-card class="my-card flat unbordered q-mt-lg" flat unbordered>
        <img alt="Quasar logo" src="~assets/yorpost.png" />
        <q-card-section class="q-mt-lg">
          <div class="text-h6 text-white">
            <q-input
              class="text-white"
              label="Email"
              outlined
              v-model="email"
            ></q-input>
          </div>
          <br />
          <div class="text-subtitle2">
            <q-input
              class="text-white"
              label="Password"
              outlined
              v-model="password"
            ></q-input>
          </div>

          <div class="q-mt-sm" align="right">
            <q-chip
              align="left"
              v-if="errMsg"
              outline
              square
              color="deep-orange"
              text-color="white"
              icon="warning"
              >{{ errMsg }}</q-chip
            ><span
              v-if="!errMsg"
              clickable
              @click="toRegister"
              text-color="red"
              color="deep-orange"
              >Not yet register?</span
            >
          </div>
        </q-card-section>

        <q-card-actions flat unbordered align="center" class="q-mt-lg">
          <q-btn color="teal-4" @click="login" label="Login"></q-btn>
          <q-btn
            @click="SignInWithGoogle"
            color="teal-4"
            icon-right="g_translate"
            label="Log in with google"
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
const email = ref("");
const password = ref("");
const router = useRouter();
const errMsg = ref();
const login = () => {
  signInWithEmailAndPassword(getAuth(), email.value, password.value)
    .then((data) => {
      router.push("/menu");
    })
    .catch((error) => {
      // alert(error.message);
      switch (error.code) {
        case "auth/invalid-email":
          errMsg.value = "Invalid Email";
          break;
        case "auth/user-not-found":
          errMsg.value = "User not found";
          break;
        case "auth/wrong-password":
          errMsg.value = "Wrong password";
          break;
        default:
          errMsg.value = "Email and Password is in correct!";
          break;
      }
    });
};
const toRegister = () => {
  router.push("/register");
};

const SignInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(getAuth(), provider)
    .then((result) => {
      router.push("/menu");
    })
    .catch((error) => {
      return error;
    });
};
</script>
<style>
.bgpic {
  position: absolute;
  margin-top: 150%;
  margin-left: -90%;
  rotate: -40deg;
  opacity: 0.2;
}
</style>
