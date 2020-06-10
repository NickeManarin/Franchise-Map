<template>
    <div id="app">
        <!-- <Home/> -->
        <router-view/>

        <b-loading :is-full-page="true" :active.sync="isLoading"></b-loading>
    </div>
</template>

<script>
    import Home from "./views/Home.vue";
    import { EventBus } from '@/other/event-bus.js';

    const customIconConfig = {
        customIconPacks: {
            unicons: {
                iconPrefix: "uil-",
                internalIcons: {
                    check: "check",
                    information: "info-circle",
                    "check-circle": "check-circle",
                    alert: "exclamation-triangle",
                    "alert-circle": "exclamation-circle",
                    "arrow-up": "arrow-up",
                    "chevron-right": "angle-right",
                    "chevron-left": "angle-left",
                    "chevron-down": "arrow-down",
                    eye: "eye",
                    "eye-off": "eye-slash",
                    "menu-down": "angle-down",
                    "menu-up": "angle-up"
                }
            }
        }
    };

    export default {
        name: "app",

        components: {
            Home
        },

        data() {
            return {
                isLoading: true
            }
        },

        async created() {
            this.$buefy.config.setOptions(customIconConfig);

            try {
                this.$store.cidades = await require('@/assets/geo/br.json');
                this.$store.estados = await require('@/assets/geo/states.json');
                this.isLoading = false;

                EventBus.$emit('baseLoaded');
            } catch (e) {
                console.log(e);
                EventBus.$emit('baseLoaded', e);
            }
        }
    };
</script>

<style lang="scss">
    //Import Bulma's core.
    @import "~bulma/sass/utilities/_all";

    //Set your colors.
    //$primary: #8c67ef;
    //$primary-invert: findColorInvert($primary);

    //Setup $colors to use as bulma classes (e.g. 'is-twitter')
    $colors: (
        "white": ($white, $black),
        "black": ($black, $white),
        "light": ($light, $light-invert),
        "dark": ($dark, $dark-invert),
        "primary": ($primary, $primary-invert),
        "link": ($link, $link-invert),
        "info": ($info, $info-invert),
        "success": ($success, $success-invert),
        "warning": ($warning, $warning-invert),
        "danger": ($danger, $danger-invert),
    );

    //Import Bulma and Buefy styles.
    @import "~bulma";
    @import "~buefy/src/scss/buefy";

    html {
        overflow-y: hidden;
    }

    #app {
        font-family: Segoe UI, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }

    .columns {
      margin: 0;
    }

    .column {
      padding: 0;
    }
</style>