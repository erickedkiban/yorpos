<template>
  <q-layout view="lHh Lpr fff" class="bg-grey-1">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GPL__toolbar" style="height: 64px">
        <q-btn
          v-if="!$q.platform.is.desktop"
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
          class="q-mx-md"
        />

        <q-toolbar-title shrink class="row items-center no-wrap">
          <img
            v-if="$q.platform.is.desktop"
            alt="Quasar logo"
            width="150"
            height="50"
            src="~assets/yorpost.png"
          />
        </q-toolbar-title>

        <q-input
          class="GPL__toolbar-input"
          dense
          v-model="search"
          placeholder="Search product or any order..."
          filled
        >
          <template v-slot:prepend>
            <q-icon v-if="search === ''" name="search" />
            <q-icon
              v-else
              name="clear"
              class="cursor-pointer"
              @click="search = ''"
            />
          </template>
        </q-input>

        <!-- <q-btn v-if="$q.screen.gt.xs" flat dense no-wrap color="primary" icon="add" no-caps label="Create" class="q-ml-sm q-px-md">
          <q-menu anchor="top end" self="top end">
            <q-list class="text-grey-8" style="min-width: 100px">
              <q-item aria-hidden="true">
                <q-item-section class="text-uppercase text-grey-7" style="font-size: 0.7rem">Create New</q-item-section>
              </q-item>
              <q-item v-for="menu in createMenu" :key="menu.text" clickable v-close-popup aria-hidden="true">
                <q-item-section avatar>
                  <q-icon :name="menu.icon" />
                </q-item-section>
                <q-item-section>{{ menu.text }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn> -->

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn round flat @click="handleSignOut">
            <q-avatar size="26px">
              <q-icon name="logout"></q-icon>

            </q-avatar>
            <q-tooltip>Log out</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      behavior="mobile"
      @click="leftDrawerOpen = false"
    >
      <q-scroll-area class="fit">
        <q-toolbar class="GPL__toolbar">
          <q-toolbar-title class="row items-center text-grey-8">
            <img
              alt="You POS Logo"
              width="150"
              height="50"
              src="~assets/yorpost.png"
            />
          </q-toolbar-title>
        </q-toolbar>

        <q-list padding>
          <q-item
            v-for="draw in drawer"
            :key="draw.text"
            clickable
            class="GPL__drawer-item"
          >
            <q-item-section avatar>
              <q-icon :name="draw.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ draw.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <!-- <q-item clickable class="GPL__drawer-item GPL__drawer-item--storage">
            <q-item-section avatar>
              <q-icon name="cloud" />
            </q-item-section>
            <q-item-section top>
              <q-item-label>Storage</q-item-label>
              <q-linear-progress :value="storage" class="q-my-sm" />
              <q-item-label caption>2.6 GB of 15 GB</q-item-label>
            </q-item-section>
          </q-item> -->
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="GPL__page-container">
      <q-separator
        vertical
        style="color: #d8dbd9; height: 100vh; position: fixed"
      />
      <router-view />

      <q-page-sticky v-if="$q.screen.gt.sm" expand position="left">
        <div class="fit q-pt-lg q-px-sm column">
          <!-- <q-btn
            round
            flat
            color="grey-8"
            stack
            no-caps
            size="26px"
            class="GPL__side-btn"
          >
            <q-icon size="22px" name="tablet" />
            <div class="GPL__side-btn__label">TABLES</div>
          </q-btn> -->

          <q-btn
            @click="link = 'menu' && $router.push('/menu')"
            round
            flat
            stack
            no-caps
            size="26px"
            :class="[
              'GPL__side-btn',
              { 'my-menu-link': isActiveRoute('/menu') },
            ]"
            :to="'/menu'"
          >
            <q-icon size="22px" name="payment" />
            <div class="GPL__side-btn__label">MENU</div>
          </q-btn>

          <q-btn
            @click="link = 'menu' && $router.push('/menu')"
            round
            flat
            color="grey-8"
            stack
            no-caps
            size="26px"
            :class="[
              'GPL__side-btn',
              { 'my-menu-link': isActiveRoute('/payment') },
            ]"
            :to="'/payment'"
          >
            <q-icon size="22px" name="assistant" />
            <div class="GPL__side-btn__label">PAYMENT</div>
            <q-badge
              floating
              color="red"
              text-color="white"
              style="top: 8px; right: 16px"
            >
              1
            </q-badge>
          </q-btn>

          <q-btn
          @click="link = 'menu' && $router.push('/menu')"
            round
            flat
            color="grey-8"
            stack
            no-caps
            size="26px"
            :class="[
              'GPL__side-btn',
              { 'my-menu-link': isActiveRoute('/orders') },
            ]"
            :to="'/orders'"
          >
            <q-icon size="22px" name="dashboard" />
            <div class="GPL__side-btn__label">ORDERS</div>
          </q-btn>

          <q-btn
            round
            flat
            color="grey-8"
            stack
            no-caps
            size="26px"
            class="GPL__side-btn"
          >
          <q-avatar size="30px">
            <img :src="photoURL">
          <q-tooltip>{{displayName}}</q-tooltip>
            </q-avatar>
          </q-btn>
        </div>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref , onMounted} from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged, signOut } from "@firebase/auth";

export default {
  name: "GooglePhotosLayout",

  setup() {
    const leftDrawerOpen = ref(false);
    const search = ref("");
    const storage = ref(0.26);

    const $q = useQuasar();
    const router = useRouter();
    const user = getAuth().currentUser;
    const displayName = ref(user.displayName)
    console.log("user",user)
    const photoURL = ref(user.photoURL)
    console.log(photoURL.value )


    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }
    const handleSignOut = () => {
      console.log("nobaria");
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          // Sign-out successful.
          router.push("/sign-in");
          console.log("Sign-out successful.");
        })
        .catch((error) => {
          router.push("/");
          console.log(error);
        });
    };

    const isActiveRoute = (routePath) => {
      return router.currentRoute.value.path === routePath;
    };

    onMounted(async () => {
      photoURL.value;
});

    return {
      leftDrawerOpen,
      displayName,
      photoURL,
      handleSignOut,
      router,
      search,
      storage,
      isActiveRoute,

      drawer: [
        // <font-awesome-icon :icon="['fat', 'tablet-rugged']" />
        { icon: "tablet", text: "TABLES", to: "home" },
        { icon: "menu", text: "MENU" },
        { icon: "payment", text: "PAYMENT" },
        { icon: "dashboard", text: "ORDERS" },
        { icon: "settings", text: "SETTINGS" },
      ],

      toggleLeftDrawer,
    };
  },
};
</script>

<style lang="sass">
.my-menu-link
  color: #2E636E !important
  // background: #26A69A
.GPL

  &__toolbar
    height: 64px

  &__toolbar-input
    width: 35%

  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px

    .q-item__section--avatar
      padding-left: 12px
      .q-icon
        color: #5f6368

    .q-item__label:not(.q-item__label--caption)
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem

    &--storage
      border-radius: 0
      margin-right: 0
      padding-top: 24px
      padding-bottom: 24px

  &__side-btn
    &__label
      font-size: 12px
      line-height: 24px
      letter-spacing: .01785714em
      font-weight: 500

  @media (min-width: 1024px)
    &__page-container
      padding-left: 94px
</style>
