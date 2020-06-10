<template>
    <b-navbar ref="navbar" class="is-light is-spaced has-shadow" wrapper-class="container is-widescreen">
        <template slot="brand">
            <b-navbar-item tag="router-link" to="/" :active="$route.path === '/'">
                <ResponsiveImage :src="require('@/assets/logo.png')" maxWidth="1.75rem" maxHeight="1.75rem"/>
                
                <transition name="slide-left">
                    <p v-if="$route.path !== '/'" class="subtitle is-5 is-unselectable has-spacing no-wrap">Instituto Eneagrama</p>
                </transition>
            </b-navbar-item>
        </template>

        <template slot="start">
            <b-navbar-item class="is-flex" tag="router-link" to="/novo" :active="$route.path === '/nova'">
                <b-icon pack="unicon" icon="uil-heart"></b-icon>
                <p class="is-unselectable">Nova</p>
            </b-navbar-item>

            <b-navbar-item class="is-flex" tag="router-link" to="/franquia" :active="$route.path === '/franquia'">
                <b-icon pack="unicon" icon="uil-scenery"></b-icon>
                <p class="is-unselectable">Franquia</p>
            </b-navbar-item>
        </template>

        <template slot="end">
            <b-navbar-item tag="div">
                <div class="buttons">
                    <b-upload v-model="file" @input="importado">
                        <a class="button is-primary">
                            <b-icon icon="upload"/>
                            <span>Importar</span>
                        </a>
                    </b-upload>

                    <b-button class="button is-primary has-side-margin" @click="exportar">
                        <b-icon icon="file-export"/>
                        <span>Exportar</span>
                    </b-button>
                </div>
            </b-navbar-item>
        </template>
    </b-navbar>
</template>

<script>
    import ResponsiveImage from "@/components/ResponsiveImage.vue";
    import { EventBus } from "@/other/event-bus.js";

    export default {
        name: "Navigation", 

        components: {
            ResponsiveImage
        },

        data() {
            return {
                isLoading: false,
                file: null,
            };
        },

        methods: {
            importado(){
                console.log('Arquivo escolhido...');

                const reader = new FileReader();
                reader.onload = e => {
                    this.$store.franquias = JSON.parse(e.target.result);

                    console.log('Arquivo lido...');                    
                    EventBus.$emit('imported');

                    //Limpe o arquivo selecionado, para poder ler novamente.
                    this.file = null;
                };
                reader.readAsText(this.file);
            },
            exportar() {
                //Loading.

                const data = JSON.stringify(this.arr)
                const blob = new Blob([data], {type: 'text/plain'})
                const e = document.createEvent('MouseEvents'),
                a = document.createElement('a');
                a.download = "test.json";
                a.href = window.URL.createObjectURL(blob);
                a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
                e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.dispatchEvent(e);

                EventBus.$emit('exported');
            }                
        }
    }
</script>

<style lang="scss" scoped>
    @keyframes slideLeftIn {
        0% { opacity: 0; transform: translateX(-1rem); max-width: 0px; }
        100% { opacity: 1; transform: translateX(0); max-width: 120px; }
    }

    @keyframes slideLeftOut {
        0% { opacity: 1; transform: translateX(0); max-width: 120px; }
        100% { opacity: 0; transform: translateX(-1rem); max-width: 0px; }
    }

    //Animation: Slide left
    .slide-left-enter-active {
      animation: slideLeftIn .2s ease-out;
    }

    .slide-left-leave-active {
      animation: slideLeftOut .2s ease-in;
    }

    .slide-left-enter, .slide-left-leave-to { 
        opacity: 0;
        max-width: 0px;
        transform: translateX(-1rem);
    }

    .slide-left-leave, .slide-left-enter-to { 
        opacity: 1;
        max-width: 120px;
        transform: translateX(0);
    }


    //Adds a spacing to the name of the app next to the logo.
    .has-spacing {
        padding-left: 0.75rem;
    }

    //Prevents the name of the app from wraping during the animation.
    .no-wrap {
        white-space: nowrap;
    }

    //Adds space to the right of the icon, so it's not too close to the text.
    .icon {
        padding: 0 10px 0 0; //Top, Right, Bottom, Left.
    }

    //Adds a space to the right of the navbar items.
    .navbar-item {
        margin: 0 5px 0 0; //Top, Right, Bottom, Left.
    }

    //Reduces the shadow of the navbar to 1px.
    .navbar.has-shadow {
        box-shadow: 0px 1px 0px hsla(0, 0%, 100%, 0.2);
    }


    .has-side-padding {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }

    .has-side-margin {
        margin-left: 1.5rem;
    }

    .navbar-end .dropdown {
        margin: 5px 0px 5px 10px;
    }
</style>