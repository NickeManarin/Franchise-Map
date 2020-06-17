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

        methods: {
            async putPopulation(){
                var novos = await require('@/assets/geo/new.json');               
                var csv = await require('raw-loader!@/assets/geo/hab.csv');
                
                var text = this.trimRight(this.trimLeft(csv.default, 'export default "'), '";');
                var rows = text.toString().split('\\r\\n');

                for (var index = 0; index < rows.length; index++) {
                    var row = rows[index].split(';');

                    var cityIndex = this.$store.cidades.features.findIndex(f => f.properties.id == row[0]);

                    if (cityIndex > -1)
                    {
                        this.$store.cidades.features[cityIndex].properties.uf = row[2];
                        this.$store.cidades.features[cityIndex].properties.pop = parseInt(row[3]);
                    }
                    else {
                        console.log('Não encontrada: ' + cityIndex + ' - ' + row[1]);
                        
                        var novaCidade = novos.features.filter(f => f.properties.codarea == row[0])[0];

                        if (novaCidade == undefined)
                        {
                            console.log(':( ' + row[0] + ' ' + row[1])
                            continue;
                        }
                        else{
                            console.log('Adicionada: ' + novaCidade);

                            this.$store.cidades.features.push({
                                "type": 'Feature',
                                "properties": {
                                    "id": row[0], 
                                    "pop": parseInt(row[3]), 
                                    "name": row[1], 
                                    "description": row[1],
                                    "uf": row[2],
                                },
                                "geometry": novaCidade.geometry,
                            });
                        }
                    }
                }
            },
            trimLeft(text, charlist) {
                if (charlist === undefined)
                    charlist = "\s";
            
                return text.replace(new RegExp("^[" + charlist + "]+"), "");
            },
            trimRight(text, charlist) {
                if (charlist === undefined)
                    charlist = "\s";
            
                return text.replace(new RegExp("[" + charlist + "]+$"), "");
            },
        },

        async created() {
            this.$buefy.config.setOptions(customIconConfig);

            try {
                this.$store.cidades = await require('@/assets/geo/br.json');
                this.$store.estados = await require('@/assets/geo/states.json');

                //await this.putPopulation();

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