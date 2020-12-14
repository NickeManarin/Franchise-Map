<template>
    <div class="home">
        <b-loading :is-full-page="true" :active.sync="isLoading"/>

        <div class="is-sidebar">
            <div v-if="!isEditing && !isAdding" class="list">
                <header>
                    <article class="media is-relative" style="min-height: 36px">
                        <div class="media-content">
                            <div class="content is-flex is-vcentered">
                                <b-icon class="is-size-5" icon="building"/>
                                <p class="subtitle is-5 is-spaced">Franquias</p>
                            </div>
                        </div>

                        <!-- <div class="media-right">
                            <b-button type="is-light" icon-right="angle-left"/>
                        </div> -->
                    </article>
                </header>

                <section>
                    <div class="columns">
                        <div class="column">
                            <p class="has-text-left">
                                <nav class="level">
                                    <div class="level-left">
                                        <div class="level-item">
                                            Filtro:
                                        </div>
                                    </div>

                                    <div class="level-right">
                                        <div class="level-item">
                                            <b-checkbox v-model="searchByCity" size="is-small" @input="search()">
                                                Filtre por cidade
                                            </b-checkbox>
                                        </div>
                                    </div>
                                </nav>
                            </p>
                            <b-input v-model="searchText" :placeholder="searchByCity ? 'Filtre por cidade da franquia' : 'Filtre por nome de franquia'" @input="debounce(() => { search() }, 300)"
                                icon-left="search" icon-right="times-circle" icon-right-clickable @icon-right-click="searchText = ''; search()"></b-input>
                        </div>
                    </div>

                    <b-table ref="table" class="has-margin-table" v-if="!isEmpty($store.franquias)" :data="franquiasFiltradas" hoverable
                        detailed detail-key="id" :opened-detailed="openedDetails" @details-open="(row, index) => closeAllOtherDetails(row, index)" 
                        :show-detail-icon="false" selectable @select="toggle" :default-sort-direction="defaultSortOrderFranquia" 
                        :default-sort="[sortFieldFranquia, sortOrderFranquia]">

                        <b-table-column class="is-unselectable" cell-class="has-pointer has-text-left" field="id" label="Id" sortable v-slot="props">
                            <span class="tag has-text-left" :style="{ backgroundColor: props.row.accent }">
                                <strong>{{props.row.id}}</strong>
                            </span>
                        </b-table-column>

                        <b-table-column class="is-unselectable" cell-class="has-pointer has-text-left" field="desc" label="Nome" sortable v-slot="props">
                            {{props.row.desc}}
                        </b-table-column>

                        <template slot="detail" slot-scope="props">
                            <div>
                                <div class="has-detail has-text-left">
                                    <p v-for="(item, key, index) in props.row.properties" :key="index">
                                        <span><strong>{{ key }}: </strong></span>
                                        <span>{{ props.row.properties[key] }}</span>
                                    </p>

                                    <p>
                                        <span><strong>População: </strong></span>
                                        <span>{{ calcularPop(props.row).toLocaleString('pt-BR') }}</span>
                                    </p>
                                </div>

                                <hr v-if="!isEmpty(props.row.properties)">

                                <div class="columns is-mobile is-centered">
                                    <div class="column"></div>

                                    <div class="column is-narrow">
                                        <b-button class="button is-link" icon-left="edit" @click="editarFranquia(props.row)">
                                            <span>Editar</span>
                                        </b-button>
                                    </div>

                                    <div class="column is-narrow">
                                        <b-button class="button is-link is-hidden-desktop" type="is-light" icon-left="share" @click="exportarFranquia(props.row)"></b-button>

                                        <b-button class="button is-link is-hidden-touch" type="is-light" icon-left="share" @click="exportarFranquia(props.row)">
                                            <span>Exportar</span>
                                        </b-button>
                                    </div>

                                    <div class="column is-narrow">
                                        <b-button class="button is-link is-hidden-desktop" type="is-danger" icon-left="trash" @click="removerFranquia(props.row)"></b-button>

                                        <b-button class="button is-link is-hidden-touch" type="is-danger" icon-left="trash" @click="removerFranquia(props.row)">
                                            <span>Excluir</span>
                                        </b-button>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </b-table>

                    <hr class="has-margin-table has-background-grey-lighter">

                    <div class="columns">
                        <div class="column is-12">
                            <b-button class="button is-primary is-expanded" icon-left="plus" @click="novaFranquia">
                                <span>Nova Franquia</span>
                            </b-button>
                        </div>
                    </div>
                </section>

                <footer>
                    <div class="columns is-mobile is-multiline is-centered has-margin-buttons">
                        <div class="column is-narrow">
                            <b-upload v-model="file" @input="importar">
                                <b-button tag="a" class="button is-primary" icon-left="upload">
                                    <span>Importar</span>
                                </b-button>
                            </b-upload>
                        </div>

                        <div class="column is-narrow">
                            <b-button class="button is-primary is-hidden-tablet" icon-left="file-export" @click="exportar()"></b-button>

                            <b-button class="button is-primary is-hidden-mobile" icon-left="file-export" @click="exportar()">
                                <span>Exportar</span>
                            </b-button>
                        </div>
                    </div>
                </footer>
            </div>

            <div v-if="isEditing || isAdding" class="edit">
                <header>
                    <article class="media is-relative">
                        <div class="media-left">
                            <b-button type="is-primary" icon-right="angle-left" rounded @click="cancelarEdição()"/>
                        </div>

                        <div class="media-content">
                            <div v-if="isEditing" class="content is-flex is-vcentered">
                                <b-icon class="is-size-5" icon="edit"/>
                                <p class="subtitle is-5 is-spaced">Editar Franquia</p>
                            </div>

                            <div v-if="isAdding" class="content is-flex is-vcentered">
                                <b-icon class="is-size-5" icon="plus"/>
                                <p class="subtitle is-5 is-spaced">Adicionar Franquia</p>
                            </div>
                        </div>
                    </article>
                </header>

                <section>
                    <!-- Propriedades fixas -->
                    <div class="has-margin-5-children">
                        <div class="columns">
                            <div class="column">
                                <p class="has-text-left">Id:</p>
                                <b-numberinput v-model="franquiaEditando.id"/>
                            </div>

                            <div class="column is-3">
                                <p class="has-text-left">Cor:</p>
                                <verte :enableAlpha="false" model="rgb" :rgbSliders="true" :value.sync="franquiaEditando.accent" @input="colorChanged($event)">
                                    <b-button :style="{ backgroundColor: !isEmpty(franquiaEditando) ? franquiaEditando.accent : null, width: '100%' }"></b-button>
                                </verte>
                            </div>
                        </div>
                    </div>

                    <div class="has-margin-5-children">
                        <p class="has-text-left">Nome:</p>
                        <b-input ref="nomeFranquiaInput" v-model="franquiaEditando.desc" placeholder="Digite o nome da franquia"/>
                    </div>

                    <div class="has-margin-5-children">
                        <p class="has-text-left">Nível:</p>
                        <b-select v-model="franquiaEditando.level" placeholder="Selecione o nível da franquia" expanded>
                            <option value="N0">N0 - Sem Franquia</option>
                            <option value="N1">N1 - Estrutura</option>
                            <option value="N2">N2 - Contrato </option>
                            <option value="N3">N3 - Desenvolvimento</option>
                            <option value="N4">N4 - Avaliação</option>
                            <option value="N5">N5 - Renovação</option>
                            <option value="N6">N6 - Crescimento</option>
                            <option value="N7">N7 - Produtos</option>
                            <option value="N8">N8 - Avaliação</option>
                            <option value="MF">MF - Master Franqueado</option>
                        </b-select>
                    </div>

                    <!-- Lista de propriedades -->
                    <p class="has-text-left has-margin-5">Outras propriedades:</p>
                    <div v-for="(item, key, index) in franquiaEditando.properties" :key="index" class="columns is-mobile is-multiline">
                        <div class="column is-11-mobile is-11-tablet is-4-desktop">
                            <b-input v-model="Object.keys(franquiaEditando.properties)[index]"/>
                        </div>

                        <div class="column">
                            <b-input v-model="franquiaEditando.properties[key]"/>
                        </div>

                        <div class="column is-narrow">
                            <b-button type="is-danger" icon-left="trash" @click="removerPropriedade(key)"/>
                        </div>
                    </div>

                    <!-- Nova propriedades -->
                    <div class="columns is-mobile is-multiline">
                        <div class="column is-11-mobile is-11-tablet is-4-desktop">
                            <b-input ref="nomePropInput" v-model="novaPropNome" placeholder="Nome" autoComplete="new-password"/>
                        </div>

                        <div class="column">
                            <b-input v-model="novaPropValor" placeholder="Valor" autoComplete="new-password"/>
                        </div>

                        <div class="column is-narrow">
                            <b-button type="is-success" icon-left="plus" @click="adicionarPropriedade()"/>
                        </div>
                    </div>    

                    <!-- Cidade polo -->
                    <p class="has-text-left has-margin-5">Cidade-polo:</p>
                    <div class="columns is-mobile">
                        <div class="column">
                            <b-autocomplete ref="hubCityInput" v-model="hubCityText" placeholder="Código ou nome da cidade" 
                                :open-on-focus="openOnFocusCity" :keep-first="true" :custom-formatter="cidadeFormatter()"
                                :data="hubCityFiltered" @select="option => hubChanged(option)" autoComplete="new-password">

                                <template slot-scope="props">
                                    <p>
                                        <span class="has-text-semibold">{{ props.option.properties.id }}</span>
                                        <span> - </span>
                                        <span>{{ props.option.properties.name }}</span>
                                    </p>
                                </template>

                                <template slot="empty">Nenhum resultado para {{ hubCityText }}</template>
                            </b-autocomplete>
                        </div>
                    </div>

                    <!-- Cidades -->
                    <p class="has-text-left has-margin-5">
                        <nav class="level">
                            <div class="level-left">
                                <div class="level-item">
                                    Cidades:
                                </div>
                            </div>

                            <div class="level-right">
                                <div class="level-item">
                                   População: {{ totalPopulacao.toLocaleString('pt-BR') }}
                                </div>
                            </div>
                        </nav>
                    </p>
                    <div>
                        <b-table ref="tableEdit" class="has-margin-table" v-if="!isEmpty(geoSelected)" :data="geoSelected.features" hoverable
                            :default-sort-direction="defaultSortOrderCidade" :default-sort="[sortFieldCidade, sortOrderCidade]">
                            <b-table-column class="is-unselectable" width="90" cell-class="is-vertical has-text-left" field="properties.id" label="Código" sortable v-slot="props">
                                <strong>{{props.row.properties.id}}</strong>
                            </b-table-column>

                            <b-table-column class="is-unselectable" cell-class="is-vertical has-text-left" field="properties.name" label="Cidade" sortable :custom-sort="sortLocale" v-slot="props">
                                {{props.row.properties.name}}
                            </b-table-column>

                            <b-table-column class="is-unselectable" width="45" cell-class="has-pointer has-text-left" v-slot="props">
                                <b-button class="button is-link is-smaller" type="is-danger" icon-left="trash" @click="removerCidade(props.row)"></b-button>
                            </b-table-column>

                            <template slot="empty">
                                <section class="section">
                                    <div class="content has-text-grey has-text-centered">
                                        <p>
                                            <span><b-icon icon="frown" size="is-large"/></span>
                                            <span>Nenhuma cidade selecionada.</span>
                                        </p>
                                    </div>
                                </section>
                            </template>
                        </b-table>

                        <div class="columns is-mobile">
                            <div class="column">
                                <b-autocomplete ref="newCityInput" v-model="newCityText" placeholder="Código ou nome da cidade" 
                                    :open-on-focus="openOnFocusCity" :keep-first="true" :custom-formatter="cidadeFormatter()"
                                    :data="filteredCities" @select="option => newCity = option" @keyup.enter.native="adicionarCidade()" 
                                    dropdown-position="top" autoComplete="new-password">

                                    <template slot-scope="props">
                                        <p>
                                            <span class="has-text-semibold">{{ props.option.properties.id }}</span>
                                            <span> - </span>
                                            <span>{{ props.option.properties.name }}</span>
                                        </p>
                                    </template>

                                    <template slot="empty">Nenhum resultado para {{ newCityText }}</template>
                                </b-autocomplete>
                            </div>

                            <div class="column is-narrow">
                                <b-button type="is-success" icon-left="plus" @click="adicionarCidade()"/>
                            </div>
                        </div>
                    </div>
                </section>

                <footer>
                    <hr class="has-margin-table has-background-grey-lighter">

                    <div class="columns is-mobile is-centered">
                        <div class="column"></div>

                        <div class="column is-narrow">
                            <b-button class="button is-link" icon-left="check" @click="aceitarEdição()">
                                <span>Aceitar</span>
                            </b-button>
                        </div>

                        <div class="column is-narrow">
                            <b-button class="button is-danger is-hidden-tablet" icon-left="times" @click="cancelarEdição()"></b-button>

                            <b-button class="button is-danger is-hidden-mobile" icon-left="times" @click="cancelarEdição()">
                                <span>Cancelar</span>
                            </b-button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
        
        <div class="is-map">
            <l-map ref="mapControl" :zoom="zoom" :center="center" :options="mapOptions">
                <l-tile-layer :url="url" :attribution="attribution"/>
                <l-control-zoom position="bottomright"/>

                <l-layer-group pane="tilePane">
                    <l-geo-json :geojson="geoStates" :options-style="statesStyle"/>
                </l-layer-group>

                <l-layer-group pane="overlayPane">
                    <l-geo-json :geojson="geoBase" :options="baseOptions" :options-style="baseStyle"/>
                    <l-geo-json v-if="showBase" :geojson="geoSelected" :options="selectedOptions" :options-style="selectedStyle"/>

                    <!-- For each franquias, Get geojson, get options -->
                    <!-- (isEditing || isAdding ? [] : geoFranchisesFiltered) -->
                    <l-geo-json v-for="franchise in geoFranchisesFiltered" :key="franchise.id" :geojson="franchise" :options="currentOptions" :options-style="getStyles(franchise)"/>

                    <l-geo-json v-if="!showBase" :geojson="geoFind" :options="findOptions" :options-style="findStyle"/>
                </l-layer-group>
            </l-map>
        </div>

        <b-modal :active.sync="isExportarFranquiaModalActive" trap-focus aria-role="dialog" aria-modal :minWidth="500" scroll="keep">
            <div class="box has-text-centered content" style="padding: 40px">
                <h2 class="title">Exportar franquia</h2>
                <p class="subtitle">Escolha quais dados exportar</p>

                <div class="columns is-centered is-multiline">
                    <div class="column">
                        <b-button class="is-light" @click="exportarFranquia(franquiaExport, 'all')">
                            <article class="media">
                                <figure class="media-left">
                                    <b-icon class="is-size-3" icon="building"/>
                                </figure>

                                <div class="media-content">
                                    <h5 class="is-size-4 has-text-weight-semibold">Franquia</h5>
                                    <p class="is-size-5 has-text-grey">Exporta todos os dados da franquia</p>
                                </div>
                            </article>
                        </b-button>
                    </div>

                    <div class="column">
                        <b-button class="is-light" @click="exportarFranquia(franquiaExport, 'city')">
                            <article class="media">
                                <figure class="media-left">
                                    <b-icon class="is-size-3" icon="map"/>
                                </figure>

                                <div class="media-content">
                                    <h5 class="is-size-4 has-text-weight-semibold">Cidades</h5>
                                    <p class="is-size-5 has-text-grey">Exporta apenas os nomes das cidades</p>
                                </div>
                            </article>
                        </b-button>
                    </div>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
    import { latLng, featureGroup } from "leaflet";
    import verte from 'verte';
    import color from 'color';
    import { EventBus } from '@/other/event-bus.js';

    export default {
        name: 'Home',

        components: { 
            verte 
        },

        data() {
            return {
                file: null, /*Json sendo importado.*/
                showBase: false,
                openedDetails: [-1],
                isExportarFranquiaModalActive: false,
                franquiaExport: {},

                isLoading: false,
                isEditing: false,
                isAdding: false,

                timeout: undefined,
                franquiasFiltradas: [],
                searchText: '',
                searchByCity: false,

                zoom: 6,
                center: latLng(-25.005973, -50.537109),
                //url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                //url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                mapOptions: {
                    zoomSnap: 0.1,
                    zoomControl: false
                },
                baseColor: "#009407",
                selectedColor: "#3388ff",
                statesColor: "#303030",
                findColor: "#202020",

                geoBase: null,
                geoSelected: null,
                geoStates: null,
                geoFranchises: [],
                geoFranchisesFiltered: [],
                geoFind: null,

                sortFieldFranquia: "desc",
                sortOrderFranquia: "asc",
                defaultSortOrderFranquia: "asc",

                sortFieldCidade: "properties.name",
                sortOrderCidade: "asc",
                defaultSortOrderCidade: "asc",

                franquiaEditando: {
                    id: -1,
                    accent: 'blue',
                    hub: '',
                    properties: {},
                    cities: []
                },

                novaPropNome: "",
                novaPropValor: "",
                newCityText: '',
                newCity: {},
                hubCityText: '',
                hubCity: {},

                totalPopulacao: 0
            }
        },

        mounted(){
            EventBus.$on('baseLoaded', (err) => { 
                this.geoBase = this.$store.cidades;
                this.geoStates = this.$store.estados;

                if (err != undefined)
                    this.showError('Não foi possível carregar a lista de cidades.');
            });

            EventBus.$on('imported', () => { 
                this.imported();
            });

            if (!this.isEmpty(this.$store.cidades))
                this.geoBase = this.$store.cidades;

            if (!this.isEmpty(this.$store.estados))
                this.geoStates = this.$store.estados;

            if (!this.isEmpty(this.$store.franquias))
                this.imported();
        },

        beforeDestroy() {
            EventBus.$off('baseLoaded');
            EventBus.$off('imported');
        },

        methods: {
            importar(){
                this.isLoading = true;

                const reader = new FileReader();
                reader.onload = e => {
                    this.$store.franquias = JSON.parse(e.target.result);

                    EventBus.$emit('imported');

                    //Limpe o arquivo selecionado, para poder ler novamente.
                    this.file = null;
                };

                this.$nextTick().then(() => reader.readAsText(this.file));
            },
            exportar() {
                const data = JSON.stringify(this.$store.franquias)
                //const data = JSON.stringify(this.$store.cidades)
                const blob = new Blob([data], {type: 'text/plain'})
                const e = document.createEvent('MouseEvents'),
                a = document.createElement('a');
                a.download = "Franquias.json";
                a.href = window.URL.createObjectURL(blob);
                a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
                e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.dispatchEvent(e);

                EventBus.$emit('exported');
            },

            sortLocale(a, b, isAsc) {
                return a.properties.name.localeCompare(b.properties.name) * (isAsc ? 1 : -1);
            },
            isEmpty(obj) {
                for(var i in obj) 
                    return false; 
    
                return true;
            },
            showError(msg) {
                this.$buefy.toast.open({
                    duration: 5000,
                    message:  msg,
                    position: 'is-bottom',
                    type: 'is-danger'
                });
            },
            async imported() {
                //Franquias foram importadas.
                let list = [];

                //Para cada franquia, buscar as cidade da lista de geoJsons.
                await this.$store.franquias.forEach(franchise => {
                    var cidades = this.geoBase.features.filter(function(city) { 
                        return franchise.cities.filter(function(f) { 
                             return f == city.properties.id;
                        }).length > 0; 
                    });

                    var population = cidades.reduce((acc, next) => acc + next.properties.pop, 0);

                    list.push({
                        "type": "FeatureCollection",
                        "franquia_id": franchise.id,
                        "franquia_nome": franchise.desc,
                        "features": cidades.map(function(entry) {
                            return {
                                "type": entry.type,
                                "properties": entry.properties,
                                "franchise": {
                                    "id": franchise.id,
                                    "name": franchise.desc,
                                    "color": franchise.accent,
                                    "pop": population,
                                },
                                "geometry": entry.geometry,
                            };
                        })
                    });
                });

                this.geoFranchises = list;
                this.search();

                this.$nextTick().then(() => this.isLoading = false);
            },
            centerOnLayers(id){
                //             North (+90)
                //                |
                // (-180) West ———+——— East (+180)
                //                |
                //             South (-90)
                //Manual work:
                //  For each geoJson layer.
                //    For each geometry on the layer.
                //        For each point on the geometry.
                //            Get coordsToLatLng.
                //                Check if it exceds the current maximum values.
                //                    If it exceds, sets as maximum
                //                    After, build LatLng bounds.
                //Via feature group:
                //  Construct featureGroup.
                //      Get layers.
                //          Add layers to feature group.
                //              After, call getBounds() on feature group.

                if (this.geoFranchisesFiltered.length < 1)
                    return;

                var group = new featureGroup();
                
                this.$refs.mapControl.mapObject.eachLayer((layer) => {
                    //Only zoom on franchises.
                    if (layer.feature == null || layer.feature.franchise == null)
                        return;

                    //Zoom on the current selected franchise.
                    if (this.openedDetails[0] != undefined && this.openedDetails[0] != -1 && layer.feature.franchise.id !== this.openedDetails[0])
                        return;

                    group.addLayer(layer);
                });

                //Adjusts the padding to the sidebar.
                var leftPad = (window.innerWidth < 769 ? 250 : window.innerWidth < 1024 ? 300 : 400) + 10; 
                this.$refs.mapControl.mapObject.fitBounds(group.getBounds(), { paddingTopLeft: [leftPad, 10], paddingBottomRight: [10, 10] });
            },
            getStyles(layer) {
                //https://leafletjs.com/reference-1.6.0.html#path
                return () => {
                    return {
                        weight: 2,
                        color: layer.features[0].franchise.color,
                        fillColor: layer.features[0].franchise.color,
                        fillOpacity: this.showBase ? 0.5 : 0.2
                    };
                };
            },
            toggle(row) {
                this.$refs.table.toggleDetails(row);

                this.centerOnLayers(row.id);
            },
            closeAllOtherDetails(row, index) {
                this.openedDetails = [row.id];
            },
            calcularPop(row) {
                var cidades = this.geoBase.features.filter(city => { 
                    return row.cities.filter(function(f) { 
                        return f == city.properties.id;
                    }).length > 0; 
                });

                return cidades.reduce((acc, next) => acc + next.properties.pop, 0);
            },

            search() {
                if (this.searchText !== undefined && this.searchText.trim().length > 0) {
                    let text = this.searchText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

                    if (this.searchByCity) {
                        //Pesquisar franquias por nome de cidade.
                        this.geoFranchisesFiltered = this.geoFranchises.filter((item) => { 
                            return item.features.some(s => s.properties.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').indexOf(text) >= 0)
                        });

                        this.franquiasFiltradas = this.$store.franquias.filter((item) => { 
                            return this.geoFranchisesFiltered.some(s => s.franquia_id === item.id);
                        });

                        //Cidades em destaque:
                        var find = this.geoFranchisesFiltered.map(m => m.features.filter(f => f.properties.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').indexOf(text) >= 0));

                        this.geoFind = {
                            "type": "FeatureCollection",
                            "features": this.selectMany(find)
                        };
                    }
                    else {
                        //Pesquisar franquias por nome.
                        this.geoFranchisesFiltered = this.geoFranchises.filter((item) => { 
                            return item.franquia_nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').indexOf(text) >= 0;
                        });

                        this.franquiasFiltradas = this.$store.franquias.filter((item) => { 
                            return item.desc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').indexOf(text) >= 0;
                        });

                        this.geoFind = {
                            "type": "FeatureCollection",
                            "features": []
                        };
                    }
                }
                else {
                    this.geoFranchisesFiltered = this.geoFranchises.filter((item) => { return true });
                    this.franquiasFiltradas = this.$store.franquias.filter((item) => { return true });
                    this.geoFind = {
                        "type": "FeatureCollection",
                        "features": []
                    };
                }

                //Collapse franchises that are not part of the search result.
                this.openedDetails[0] = -1;

                this.$nextTick().then(() => {
                    this.centerOnLayers();
                });
            },
            selectMany(array, arr = []) {
                for (let item of array) {
                    if (item && item.length)
                        arr = this.selectMany(item, arr);
                    else
                        arr.push(item);
                }
                return arr;
            },
            debounce(func, wait, immediate) {
                var later = function() {
                    this.timeout = null;
                    
                    if (!immediate) 
                        func.apply();
                };
                
                var callNow = immediate && !this.timeout;
                clearTimeout(this.timeout);
                this.timeout = setTimeout(later, wait);
                
                if (callNow) 
                    func.apply();
            },
            getRandomColor(saturation, value) {
                //Based on http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
                var hue = Math.random();
                var goldenRatio = 0.618033988749895;

                hue += goldenRatio;
                hue %= 1;
                
                if (typeof saturation !== "number")
                    saturation = 0.85;
                    
                if (typeof value !== "number")
                    value = 0.95;

                return color({
                    h: hue * 360,
                    s: saturation * 100,
                    v: value * 100
                }).hsl().string();
            },
            generateBlob(name, obj, isJson) {
                if (!name)
                    name = 'Export' + (isJson ? '.json' : '');

                const data = isJson ? JSON.stringify(obj) : obj;
                const blob = new Blob([data], {type: 'text/plain'});
                const e = document.createEvent('MouseEvents'),
                a = document.createElement('a');
                a.download = name;
                a.href = window.URL.createObjectURL(blob);
                a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
                e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.dispatchEvent(e);
            },

            novaFranquia() {
                this.isAdding = true;

                // this.franquiaEditando = Object.assign({}, this.franquiaEditando, { 
                //     id: Math.max(...this.$store.franquias.map(item => item.id)) + 1, //Spread operator.
                //     idAtual: undefined,
                //     accent: 'yellow',
                //     properties: { },
                //     cities: []
                // });

                this.franquiaEditando = {
                    id: this.isEmpty(this.$store.franquias) ? 0 : Math.max(...this.$store.franquias.map(item => item.id)) + 1, //Spread operator.
                    idAtual: undefined,
                    desc: '',
                    accent: this.getRandomColor(),
                    hub: '',
                    properties: {},
                    cities: []
                };

                this.geoSelected = {
                    "type": "FeatureCollection",
                    "features": []
                }
                            
                this.totalPopulacao = 0;

                this.$nextTick().then(() => {
                    this.showBase = true;
                    this.$refs.nomeFranquiaInput.focus();
                });
            },
            async editarFranquia(row) {
                this.isLoading = true;
                this.isEditing = true;
                
                await this.$nextTick().then(async () => {
                    var franquia = await this.$store.franquias.filter((item) => { return item.id === row.id});

                    //this.franquiaEditando = Object.assign({}, this.franquiaEditando, JSON.parse(JSON.stringify(this.$store.franquias[row.id])));
                    //this.franquiaEditando = Object.assign(this.franquiaEditando, JSON.parse(JSON.stringify(this.$store.franquias[row.id])));
                    this.franquiaEditando = await JSON.parse(JSON.stringify(franquia[0]));
                    this.franquiaEditando.idAtual = this.franquiaEditando.id; //Para deixar salvar em cima desse mesmo ID.

                    //Copiar cidades da franquia para o objeto selected.
                    var cidades = await this.geoBase.features.filter(city => { 
                        return this.franquiaEditando.cities.filter(function(f) { 
                            return f == city.properties.id;
                        }).length > 0; 
                    });

                    //Seleciona o objeto de cidade, para exibir o Id e nome no autocomplete.
                    this.hubCity = cidades.find(city => city.properties.id === this.franquiaEditando.hub);
                    this.$refs.hubCityInput.setSelected(this.hubCity);

                    this.totalPopulacao = cidades.reduce((acc, next) => acc + next.properties.pop, 0);

                    this.geoSelected = await {
                        "type": "FeatureCollection",
                        "franquia_id": this.franquiaEditando.id,
                        "franquia_nome": this.franquiaEditando.desc,
                        "features": await cidades.map(entry => {
                            return {
                                "type": entry.type,
                                "properties": entry.properties,
                                "franchise": {
                                    "id": this.franquiaEditando.id,
                                    "name": this.franquiaEditando.desc,
                                    "color": this.franquiaEditando.accent,
                                },
                                "geometry": entry.geometry,
                            };
                        })
                    }

                    this.showBase = true;
                });   

                this.$nextTick().then(() => {
                    this.isLoading = false;
                    this.$refs.newCityInput.focus();
                });
            },
            colorChanged(color) {
                this.franquiaEditando.accent = color;
            },
            adicionarPropriedade() {
                //Validar.
                if (this.novaPropNome in this.franquiaEditando.properties) {
                    this.showError('Já existe uma propriedade com esse nome.');
                    return;
                }

                if (this.novaPropValor === undefined || this.novaPropValor == null || this.novaPropValor.trim().length < 1 ) {
                    this.showError('Escreva alguma coisa na propriedade.');
                    return;
                }
                
                this.$set(this.franquiaEditando.properties, this.novaPropNome, this.novaPropValor.trim());
                this.novaPropNome = null;
                this.novaPropValor = null;

                this.$refs.nomePropInput.focus();
            },
            removerPropriedade(key) {
                this.$delete(this.franquiaEditando.properties, key);
                this.$refs.nomePropInput.focus();
            },
            adicionarCidade() {
                if (this.isEmpty(this.newCity)) {
                    this.showError('Selecione uma cidade para ser adicionada.');
                    return;
                }

                if (this.geoSelected.features.filter(f => f.properties.id === this.newCity.properties.id).length > 0) {
                    this.showError('Esta cidade já foi adicionada.');
                    return;
                }

                //Pegar cidade do auto-complete e adicione na lista de selecionadas.
                var cidades = this.geoBase.features.filter(f => f.properties.id === this.newCity.properties.id);

                if (cidades.length < 1) {
                    this.showError('Não foi possível adicionar a cidade.');
                    return;
                }

                //Adicionar cidade para o objeto de franquia.
                this.franquiaEditando.cities.push(cidades[0].properties.id);

                //Adicionar cidade para o objeto de cidade.
                this.geoSelected.features.push(cidades[0]);

                this.totalPopulacao = this.geoSelected.features.reduce((acc, next) => acc + next.properties.pop, 0);

                //Limpa as propriedades.
                this.newCityText = '';
                this.newCity = {};
                this.$refs.newCityInput.focus();
            },
            cidadeFormatter() {
                //Formata a exibição da cidade selecionada no autocomplete.
                return (e) => { return e.properties.id + " - " + e.properties.name; };
            },
            hubChanged(selected) {
                this.hubCity = selected
                this.franquiaEditando.hub = (selected == null || this.isEmpty(selected)) ? null : selected.properties.id;                
            },
            removerCidade(row) {
                //Remove a cidade da tabela.
                this.removerCidadeInterno(row.properties.id);
            },
            removerCidadeInterno(id) {
                //Remover cidades para da lista de selecionadas.
                var cidades = this.geoSelected.features.filter(f => f.properties.id === id);

                if (cidades.length < 1) {
                    this.showError('Não foi possível remover a cidade.');
                    return;
                }

                //Remover cidade do objeto de franquia.
                this.franquiaEditando.cities = this.franquiaEditando.cities.filter(item => item !== cidades[0].properties.id);

                //Remover cidade do objeto de cidade.
                this.geoSelected.features = this.geoSelected.features.filter(item => item.properties.id !== cidades[0].properties.id);
                this.totalPopulacao = this.geoSelected.features.reduce((acc, next) => acc + next.properties.pop, 0);
            },

            aceitarEdição() {
                //Validar.
                if (this.franquiaEditando.idAtual !== this.franquiaEditando.id && this.$store.franquias.filter((item) => { item.id === this.franquiaEditando.id}).length > 0) {
                    this.showError('Já existe uma franquia com o mesmo ID.');
                    return;
                }

                if (this.franquiaEditando.desc === undefined || this.franquiaEditando.desc.trim().length < 1) {
                    this.showError('Digite o nome da franquia.');
                    return;
                }

                if (this.franquiaEditando.level === undefined || this.franquiaEditando.level.trim().length < 1) {
                    this.showError('Selecione o nível da franquia.');
                    return;
                }

                if (this.franquiaEditando.hub === undefined) {
                    this.showError('Escolha a cidade-polo da franquia.');
                    return;
                }

                if (this.geoSelected.features.find(f => f.properties.id === this.franquiaEditando.hub) === undefined) {
                    this.showError('A cidade-polo não faz parte da lista de cidades da franquia.');
                    return;
                }

                //Para salvar edições, apenas apagar objeto antigo e colocar novo no lugar. 
                if (this.isEditing) {
                    this.$store.franquias = this.$store.franquias.filter(item => item.id !== this.franquiaEditando.idAtual);
                    this.geoFranchises = this.geoFranchises.filter(item => item.franquia_id !== this.franquiaEditando.idAtual);
                    this.search();
                }

                //Remove a propriedade auxiliar.
                this.$delete(this.franquiaEditando, 'idAtual');
                
                //Passar propriedades para o objeto principal.
                this.$store.franquias.push(this.franquiaEditando);

                //Soma o total de habitantes das cidades.
                var population = this.geoSelected.features.reduce((acc, next) => acc + next.properties.pop, 0);

                this.geoFranchises.push({
                    "type": "FeatureCollection",
                    "franquia_id": this.franquiaEditando.id,
                    "franquia_nome": this.franquiaEditando.desc,
                    "features": this.geoSelected.features.map((entry) => {
                        return {
                            "type": entry.type,
                            "properties": entry.properties,
                            "franchise": {
                                "id": this.franquiaEditando.id,
                                "name": this.franquiaEditando.desc,
                                "color": this.franquiaEditando.accent,
                                "pop": population,
                            },
                            "geometry": entry.geometry,
                        };
                    })
                });

                this.geoSelected = {};
                this.franquiaEditando = {};
                this.novaPropNome = '';
                this.novaPropValor = '';
                this.newCity = {};
                this.newCityText = '';
                this.hubCity = {};
                this.hubCityText = '';
                this.isEditing = false;
                this.isAdding = false;
                this.showBase = false;

                this.search();
            },
            cancelarEdição(cancel) {
                if (cancel === true) {
                    this.geoSelected = {};
                    this.franquiaEditando = {};
                    this.novaPropNome = '';
                    this.novaPropValor = '';
                    this.newCity = {};
                    this.newCityText = '';
                    this.hubCity = {};
                    this.hubCityText = '';

                    this.isEditing = false;
                    this.isAdding = false;
                    this.showBase = false;

                    this.search();
                    return;
                }

                this.$buefy.dialog.confirm({
                    title: 'Cancelando ' + (this.isEditing ? 'Edição' : 'Adição'),
                    message: 'Você deseja <b>cancelar</b> a ' + (this.isEditing ? 'edição' : 'adição') + ' da franquia? Suas alterações serão perdidas.',
                    confirmText: 'Sim',
                    cancelText: 'Não',
                    type: 'is-danger',
                    hasIcon: true,
                    onConfirm: () => this.cancelarEdição(true)
                });
            },
            exportarFranquia(row, type) {
                if (type) {
                    switch (type) {
                        case "all":
                            this.generateBlob('Franquia.json', new Array(row), true);
                        break;

                        case "city":
                            var cidades = this.geoBase.features.filter(function(city) { 
                                return row.cities.filter(function(f) { 
                                    return f == city.properties.id;
                                }).length > 0; 
                            });

                            var list = cidades.map(entry => { return entry.properties.name + ", " + entry.properties.pop });
                            list.push('');
                            list.push('Total: ' + cidades.reduce((acc, next) => acc + next.properties.pop, 0));

                            this.generateBlob('Cidades.txt', list.join('\r\n'));
                        break;
                    }

                    this.isExportarFranquiaModalActive = false;
                    this.franquiaExport = {};
                    return;
                }

                this.isExportarFranquiaModalActive = true;
                this.franquiaExport = row;
            },
            removerFranquia(row, remove) {
                if (remove === true) {
                    this.$store.franquias = this.$store.franquias.filter(item => item.id !== row.id);
                    this.geoFranchises = this.geoFranchises.filter(item => item.franquia_id !== row.id);

                    this.$buefy.toast.open('Franquia removida!');
                    this.search();
                    return;
                }

                this.$buefy.dialog.confirm({
                    title: 'Removendo Franquia',
                    message: 'Você deseja <b>remover</b> a franquia? Esta ação não pode ser desfeita.',
                    confirmText: 'Remover Franquia',
                    cancelText: 'Cancelar',
                    type: 'is-danger',
                    hasIcon: true,
                    onConfirm: () => this.removerFranquia(row, true)
                });
            },
        },

        computed: {
            baseOptions() {
                var touch = this.showBase;

                return {
                    onEachFeature: this.baseFeature
                };
            },
            baseStyle() {
                //Touch this property to make the computed property recalculate.
                const color = this.baseColor; 
                
                //https://leafletjs.com/reference-1.6.0.html#path
                return () => {
                    return {
                        cursor: this.showBase ? 'pointer' : 'arrow',
                        weight: 2,
                        color: color,
                        fillColor: this.showBase ? '#00fa0c' : '#fffff0',
                        opacity: this.showBase ? 0.3 : 0.05,
                        fillOpacity: this.showBase ? 0.1 : 0.05
                    };
                };
            },
            baseFeature() {
                return (feature, layer) => {   
                    if (feature.properties.pop == null){
                        return;
                    }

                    if (!this.showBase) {
                        layer.bindTooltip("<div class=has-text-left>" + 
                            "<p><b>Código:</b> " + feature.properties.id + "</p>" + 
                            "<p><b>Nome:</b> " + feature.properties.name +"</p>" + 
                            "<p><b>Habit.:</b> " + feature.properties.pop.toLocaleString("pt-BR") +"</p>" + 
                            "</div>", {  
                            permanent: false, 
                            sticky: true 
                        });
                        return;
                    }

                    layer.on('click', e => {
                        //Adicionar cidades para a lista de selecionadas.
                        var cidades = this.geoBase.features.filter(f => f.properties.id === feature.properties.id);

                        if (cidades.length < 1) {
                            this.showError('Não foi possível adicionar a cidade.');
                            return;
                        }

                        //Adicionar cidade para o objeto de franquia.
                        this.franquiaEditando.cities.push(cidades[0].properties.id);

                        //Adicionar cidade para o objeto de cidade.
                        this.geoSelected.features.push(cidades[0]);
                        this.totalPopulacao = this.geoSelected.features.reduce((acc, next) => acc + next.properties.pop, 0);
                    });

                    //Adiciona tooltip nas cidades.
                    layer.bindTooltip("<div class=has-text-left>" + 
                        "<p><b>Código:</b> " + feature.properties.id + "</p>" + 
                        "<p><b>Nome:</b> " + feature.properties.name +"</p>" + 
                        "<p><b>Habit.:</b> " + feature.properties.pop.toLocaleString("pt-BR") +"</p>" + 
                        "<p>Clique para selecionar.</p>" + 
                        "</div>", {  
                        permanent: false, 
                        sticky: true 
                    });
                };
            },

            selectedOptions() {
                var touch = this.showBase;

                return {
                    onEachFeature: this.selectedFeature
                };
            },
            selectedStyle() {
                //Touch this property to make the computed property recalculate.
                var color = this.selectedColor; 
                var touch = this.showBase;

                //https://leafletjs.com/reference-1.6.0.html#path
                return () => {
                    return {
                        weight: 2,
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.4
                    };
                };
            },
            selectedFeature() {
                return (feature, layer) => {
                    layer.on('click', e => {
                        //Remover cidades para da lista de selecionadas.
                        this.removerCidadeInterno(feature.properties.id);
                    });

                    //Adiciona tooltip nas cidades.
                    layer.bindTooltip("<div class=has-text-left>" + 
                        "<p><b>Código:</b> " + feature.properties.id + "</p>" + 
                        "<p><b>Nome:</b> " + feature.properties.name +"</p>" + 
                        "<p><b>Habit.:</b> " + feature.properties.pop.toLocaleString("pt-BR") +"</p>" + 
                        "<p>Clique para remover seleção.</p>" + 
                        "</div>", 
                        { permanent: false, sticky: true });
                };
            },

            findOptions() {
                return {
                    onEachFeature: this.findFeature
                };
            },
            findStyle() {
                //Touch this property to make the computed property recalculate.
                const color = this.findColor; 
                                
                //https://leafletjs.com/reference-1.6.0.html#path
                return () => {
                    return {
                        weight: 2,
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.7
                    };
                };
            },
            findFeature() {
                return (feature, layer) => {
                    if (feature.properties.pop == null){
                        return;
                    }

                    layer.on('click', e => {
                        //Não abilita o clique durante a edição.
                        if (this.isEditing === true || this.isAdding === true )
                            return;

                        //Exibir dados da franquia.
                        var franquias = this.$store.franquias.filter(f => f.id === feature.franchise.id);

                        if (franquias.length < 1) {
                            this.showError('Não foi possível encontrar a franquia pela cidade.');
                            return;
                        }

                        this.toggle(franquias[0]);
                    });

                    //Adiciona tooltip nas cidades.
                    layer.bindTooltip("<div class=has-text-left>" + 
                        "<p><b>Franquia:</b> " + feature.franchise.name + "</p>" + 
                        "<p><b>Cidade:</b> " + feature.properties.name + "</p>" + 
                        "<p><b>Habit.:</b> " + feature.properties.pop.toLocaleString("pt-BR") + "</p>" + 
                        "<p><b>Total:</b> " + feature.franchise.pop.toLocaleString("pt-BR") + "</p>" + 
                        "</div>", 
                        { permanent: false,  sticky: true });
                };
            },

            statesOptions() {
                return {
                    onEachFeature: this.statesFeature
                };
            },
            statesStyle() {
                //Touch this property to make the computed property recalculate.
                const color = this.statesColor; 
                
                //https://leafletjs.com/reference-1.6.0.html#path
                return () => {
                    return {
                        weight: 2,
                        color: color,
                        fillColor: color,
                        opacity: 0.6,
                        fillOpacity: 0
                    };
                };
            },
            statesFeature() {
                return (feature, layer) => {

                };
            },

            currentOptions() {
                return {
                    onEachFeature: this.currentFeature
                };
            },
            currentFeature() {
                return (feature, layer) => {
                    layer.on('click', e => {
                        //Não abilita o clique durante a edição.
                        if (this.isEditing === true || this.isAdding === true )
                            return;

                        //Exibir dados da franquia.
                        var franquias = this.$store.franquias.filter(f => f.id === feature.franchise.id);

                        if (franquias.length < 1) {
                            this.showError('Não foi possível encontrar a franquia pela cidade.');
                            return;
                        }

                        this.toggle(franquias[0]);
                    });

                    //Adiciona tooltip nas cidades.
                    layer.bindTooltip("<div class=has-text-left>" + 
                        "<p><b>Franquia:</b> " + feature.franchise.name + "</p>" + 
                        "<p><b>Cidade:</b> " + feature.properties.name + "</p>" + 
                        "<p><b>Habit.:</b> " + feature.properties.pop.toLocaleString("pt-BR") + "</p>" + 
                        "<p><b>Total:</b> " + feature.franchise.pop.toLocaleString("pt-BR") + "</p>" + 
                        "</div>", 
                        { permanent: false,  sticky: true });
                };
            },

            openOnFocusCity() {
                //Se nenhuma cidade foi selecionada ainda ou se o texto não for igual a selecionada, exibe o resultado.
                return this.isEmpty(this.newCity) || this.newCityText !== (this.newCity.properties.id + " - " + this.newCity.properties.name);
            },
            filteredCities() {
                let text = this.newCityText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

                return this.geoBase.features.filter(city => {
                    return (city.properties.id + " - " + city.properties.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').indexOf(text) >= 0;
                }).slice(0, 90);
            },
            openOnFocusHub() {
                //Se nenhuma cidade foi selecionada ainda ou se o texto não for igual a selecionada, exibe o resultado.
                return this.isEmpty(this.hubCity) || this.hubCityText !== (this.hubCity.properties.id + " - " + this.hubCity.properties.name);
            },
            hubCityFiltered() {
                if (this.isEmpty(this.geoSelected))
                    return [];

                let text = this.hubCityText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

                return this.geoSelected.features.filter(city => {
                    return (city.properties.id + " - " + city.properties.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').indexOf(text) >= 0;
                }).slice(0, 30);
            }
        },
    }
</script>

<style lang="scss">
    @import "~bulma/sass/utilities/_all";

    .is-sidebar {
        position: absolute;
        z-index: 10; /* Stay on top */
        top: 0;
        left: 0;
        bottom: 0;
        width: 400px;
        background-color: rgba(255, 255, 255, 0.8);

        @include until($desktop) {
            width: 300px;
        }

        @include until($tablet) {
            width: 250px;
        }
    }

    .is-sidebar .list {
        //Makes the div contents to be displayed vertically.
        background-color: rgba(255, 255, 255, 0);
        display: flex;
        flex-flow: column;
        height: 100%;
    }

    .is-sidebar .edit {
        background-color: rgba(255, 255, 255, 0.1);
        display: flex;
        flex-flow: column;
        height: 100%;
    }
   
    .is-sidebar header {
        margin: 5px 10px;
    }

    //Makes the section to expand the flex.
    .is-sidebar .list section, .is-sidebar .edit section {
        flex: 2;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .is-sidebar .list .column {
        margin: 5px;
    }

    .is-sidebar .edit .columns {
        margin-right: 5px;
    }

    .is-sidebar .edit .column {
        margin: 5px;
    }

    .is-sidebar .list .columns:last-child, 
    .is-sidebar .edit .columns:last-child, 
    .is-sidebar .edit .columns:not(:last-child) {
        margin-bottom: 0 !important;
    }

    .b-table .columns:last-child {
        margin-bottom: -0.75rem !important;
    }

    //If there's too many properties, make them scroll.
    .has-detail {
        max-height: 200px;
        overflow-y: auto;
    }

    //Resizes the icon of the modal dialog.
    .dialog .icon {
        font-size: 3rem;
    }

    .b-table .table tr.detail .detail-container {
        padding: 0rem !important;
    }

    .detail-container hr {
        background-color: hsl(0, 0, 90%);
        margin: 0.75rem 0;
    }

    .has-margin-buttons {
        margin: 10px;
    }

    .has-margin-table {
        margin: 10px;
    }

    .has-pointer {
        cursor: pointer;
    }

    .has-margin-5, .has-margin-5-children > * {
        margin: 5px;
    }

    .is-vertical {
        vertical-align: middle;
    }

    //Corrige arredondamento do botão arredondado.
    .button.is-rounded {
        padding-left: 0.75rem !important;
        padding-right: 0.75rem !important;
    }

    .content.is-vcentered {
        margin: 0;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }

    .is-map {
        width: 100vw;
        height: 100vh;
    }

    .vue2leaflet-map {
        z-index: 5; /*Stays behind the sidebar*/
    }

    //Fills up the space.
    .column {
        height: 100%;
    }

    .box .column {
        padding: 0.75rem 0.5rem !important;
    }

    //Makes the buttons inside the columns more rounded and expanded.
    .column .button {
        white-space: normal;
        border-radius: 5px;
        justify-content: stretch;
    }

    .box .column .button {
        //padding: 0.75rem;
        width: 100%;
        height: 100%;
    }
</style>

<style lang="scss">
    @import "~bulma/sass/utilities/_all";

    //Adjustments to the color picker
    .verte__menu-origin {
        position: fixed !important;
        z-index: 500 !important;   
        top: 120px !important;

        @include until($tablet) {
            top: 190px !important;
        }
    }

    .verte {
        width: 100%;
        height: unset !important;
    }

    .verte__guide {
        height: 100% !important;
        width: 100% !important;
    }

    .b-table .section {
        padding: 0rem !important;
    }

    .button.is-smaller {
        height: 28px !important;
    }
</style>