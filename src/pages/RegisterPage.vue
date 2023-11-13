<template>
  <div>
    <div class="q-pa-lg row justify-center">
      <q-card class="my-card flat unbordered" flat unbordered s>
        <img alt="Quasar logo" src="~assets/yorpost.png" />
        <q-card-section>
          <div class="text-h6">
            <q-input label="Email" outlined v-model="email"></q-input>
          </div>
          <br />
          <div class="text-subtitle2">
            <q-input label="Password" outlined v-model="password"></q-input>
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
              @click="toLogin"
              text-color="red"
              color="deep-orange"
              >Already register?</span
            >
          </div>
        </q-card-section>

        <q-card-actions flat unbordered align="center" class="q-mt-lg">
          <q-btn color="teal-4" @click="register">Register</q-btn>
          <q-btn
            @click="SignInWithGoogle"
            color="teal-4"
            icon-right="g_translate"
            label="Register with google"
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
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
const email = ref("");
const password = ref("");
const router = useRouter();
const register = () => {
  createUserWithEmailAndPassword(getAuth(), email.value, password.value)
    .then((data) => {
      console.log("success");
      router.push("/feed");
    })
    .catch((error) => {
      console.log(error.code);
      alert(error.message);
    });
};
const toLogin = () => {
  router.push("/sign-in");
};
const SignInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(getAuth(), provider)
    .then((result) => {
      console.log(result.user);
      router.push("/feed");
    })
    .catch((error) => {
      console.log(error);
    });
};
</script>
