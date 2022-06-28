sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "PM030/APP2/model/formatter",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter",
    "PM030/APP2/util/LocalFormatter",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/core/Fragment',
    "PM030/APP2/util/underscore-min",
    'sap/m/MessageToast'
],
/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.core.routing.History} History
     * @param {typeof sap.ui.core.UIComponent} UIComponent
     */
    function (Controller, History, UIComponent, formatter, MessageBox, Sorter, LocalFormatter, Filter, FilterOperator, Fragment, underscore, MessageToast) {
    "use strict";

    return Controller.extend("PM030.APP2.controller.BaseController", {
        formatter: formatter,
        LocalFormatter: LocalFormatter,
        underscore: underscore,
        /**
             * Convenience method for getting the view model by name in every controller of the application.
             * @public
             * @param {string} sName the model name
             * @returns {sap.ui.model.Model} the model instance
             */

        getModel: function (sName) {
            return this.getView().getModel(sName);
        },
        Shpl: async function (ShplName, ShplType, aFilter) {

            var sFilter = {
                "ReturnFieldValueSet": [{}]
            };
            sFilter.ShplType = ShplType;
            sFilter.ShplName = ShplName;
            sFilter.IFilterDataSet = aFilter;
            // Shlpname Shlpfield Sign Option Low

            var result = await this._saveHana("/dySearch", sFilter);
            if (result.ReturnFieldValueSet !== undefined) {
                result = result.ReturnFieldValueSet.results;
            } else {
                result = [];
            }

            return result;
        },
        /**
             * Convenience method for setting the view model in every controller of the application.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.mvc.View} the view instance
             */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
             * Convenience method for getting the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
             * Method for navigation to specific view
             * @public
             * @param {string} psTarget Parameter containing the string for the target navigation
             * @param {Object.<string, string>} pmParameters? Parameters for navigation
             * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
             */
        navTo: function (psTarget, pmParameters, pbReplace) {
            this.getRouter().navTo(psTarget, pmParameters, pbReplace);
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.back();
            } else {
                this.getRouter().navTo("appHome", {}, true /*no history*/
                );
            }
        },
        onFilterSedeTecnica: async function () {
            var sSedeTecnica = this.getView().getModel("sSedeTecnica").getData();

            var aFilter = [],
                oFilter = {},
                sData = [];

            aFilter.push(new Filter("LANGUAGE", FilterOperator.EQ, "IT")); // fisso IT - todo
            if (sSedeTecnica.SEDE_TECNICA != "" && sSedeTecnica.SEDE_TECNICA != null) {
                aFilter.push(new Filter("SEDE_TECNICA", FilterOperator.EQ, sSedeTecnica.SEDE_TECNICA));
            }
            if (sSedeTecnica.LIVELLO1 != "" && sSedeTecnica.LIVELLO1 != null) {
                aFilter.push(new Filter("LIVELLO1", FilterOperator.EQ, sSedeTecnica.LIVELLO1));
            }
            if (sSedeTecnica.LIVELLO2 != "" && sSedeTecnica.LIVELLO2 != null) {
                aFilter.push(new Filter("LIVELLO2", FilterOperator.EQ, sSedeTecnica.LIVELLO2));
            }
            if (sSedeTecnica.LIVELLO3 != "" && sSedeTecnica.LIVELLO3 != null) {
                aFilter.push(this.filterLivello3(sSedeTecnica.LIVELLO3));
            }
            if (sSedeTecnica.LIVELLO4 != "" && sSedeTecnica.LIVELLO4 != null) {
                aFilter.push(this.filterLivello4(sSedeTecnica.LIVELLO4));
            }
            if (sSedeTecnica.LIVELLO5 != "" && sSedeTecnica.LIVELLO5 != null) {
                aFilter.push(this.filterLivello5(sSedeTecnica.LIVELLO5));
            }
            if (sSedeTecnica.LIVELLO6 != "" && sSedeTecnica.LIVELLO6 != null) {
                aFilter.push(this.filterLivello6(sSedeTecnica.LIVELLO6));
            }

            var oModel = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "SEDE_TECNICA");
            oModel.setData(sData);
            this.getView().setModel(oModel, "SedeTecnica");

            var oModel1 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO1");
            oModel1.setData(sData);
            this.getView().setModel(oModel1, "Livello1");

            var oModel2 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO2");
            oModel2.setData(sData);
            this.getView().setModel(oModel2, "Livello2");

            var oModel3 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO3");
            oModel3.setData(sData);
            this.getView().setModel(oModel3, "Livello3");

            var oModel4 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO4");
            oModel4.setData(sData);
            this.getView().setModel(oModel4, "Livello4");

            var oModel5 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO5");
            oModel5.setData(sData);
            this.getView().setModel(oModel5, "Livello5");

            var oModel6 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO6");
            oModel6.setData(sData);
            this.getView().setModel(oModel6, "Livello6");

            var oBinding = this.byId("tSedeTecnica").getBinding("items");
            oBinding.filter(aFilter);

        },
        onResetSedeTecnica: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {
                SEDE_TECNICA: "",
                LIVELLO1: "",
                LIVELLO2: "",
                LIVELLO3: "",
                LIVELLO4: "",
                LIVELLO5: "",
                LIVELLO6: ""
            };
            oModel.setData(sData);
            this.getView().setModel(oModel, "sSedeTecnica");
            this.onFilterSedeTecnica();
        },
        filterLivello3: function (LIVELLO3) {

            var value = "";
            if (LIVELLO3 === null || LIVELLO3 === undefined || LIVELLO3 === "") {
                return new Filter("LIVELLO3", FilterOperator.EQ, "");
            } else {

                var fLIVELLO3 = [];

                fLIVELLO3.push(new Filter("LIVELLO3", FilterOperator.EQ, LIVELLO3)); // ++
                value = LIVELLO3[0] + "x";
                fLIVELLO3.push(new Filter("LIVELLO3", FilterOperator.EQ, value));
                // +x

                // 2 -> numero
                if (!isNaN(Number(LIVELLO3[1]))) {
                    value = LIVELLO3[0] + "n";
                    fLIVELLO3.push(new Filter("LIVELLO3", FilterOperator.EQ, value)); // +n
                    fLIVELLO3.push(new Filter("LIVELLO3", FilterOperator.EQ, "xn")); // xn
                }

                // 1 -> alfabetico
                if (isNaN(Number(LIVELLO3[0]))) {
                    fLIVELLO3.push(new Filter("LIVELLO3", FilterOperator.EQ, "kx")); // kx
                }fLIVELLO3 = new sap.ui.model.Filter({filters: fLIVELLO3, and: false});
                return fLIVELLO3;
            }

        },
        filterLivello4: function (LIVELLO4) {

            var value = "";
            if (LIVELLO4 === null || LIVELLO4 === undefined || LIVELLO4 === "") {
                return new Filter("LIVELLO4", FilterOperator.EQ, "");
            } else {

                var fLIVELLO4 = [];

                fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, LIVELLO4)); // ++
                if (LIVELLO4.length === 3) {
                    value = LIVELLO4[0] + LIVELLO4[1] + "x";
                    fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, value)); // ++x
                }
                // -> numero
                if (!isNaN(Number(LIVELLO4))) {
                    fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, "nnn")); // nnn
                    fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, "nn")); // nn
                }

                // 1 -> numero
                if (!isNaN(Number(LIVELLO4[0])) && LIVELLO4.length === 2) {
                    value = "n" + LIVELLO4[1];
                    fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, value)); // n+
                }

                // 2 -> numero
                if (!isNaN(Number(LIVELLO4[1])) && LIVELLO4.length === 2) {
                    value = LIVELLO4[0] + "n";
                    fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, value)); // +n
                }

                // 1 -> alfabetico
                if (isNaN(Number(LIVELLO4[0])) && LIVELLO4.length === 2) {
                    value = "k" + LIVELLO4[1];
                    fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, value));
                    // k+
                    // 1 -> alfabetico 2 -> numero
                    if (!isNaN(Number(LIVELLO4[1]))) {
                        fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, "kn")); // kn
                    }
                }

                fLIVELLO4 = new sap.ui.model.Filter({filters: fLIVELLO4, and: false});
                return fLIVELLO4;
            }
        },
        filterLivello5: function (LIVELLO5) {

            var value = "";
            if (LIVELLO5 === null || LIVELLO5 === undefined || LIVELLO5 === "") {
                return new Filter("LIVELLO5", FilterOperator.EQ, "");
            } else {

                var fLIVELLO5 = [];

                fLIVELLO5.push(new Filter("LIVELLO5", FilterOperator.EQ, LIVELLO5)); // +++
                fLIVELLO5.push(new Filter("LIVELLO5", FilterOperator.EQ, "xx"));
                // xx

                // if numero
                if (!isNaN(Number(LIVELLO5))) { //
                    fLIVELLO5.push(new Filter("LIVELLO5", FilterOperator.EQ, "nn")); // nn
                }

                // 2 -> numero
                if (!isNaN(Number(LIVELLO5[1])) && LIVELLO5.length === 2) {
                    value = LIVELLO5[0] + "n";
                    fLIVELLO5.push(new Filter("LIVELLO5", FilterOperator.EQ, value)); // +n
                }


                // 2 -> alfabetico
                if (isNaN(Number(LIVELLO5[1])) && LIVELLO5.length === 2) {
                    value = LIVELLO5[0] + "k";
                    fLIVELLO5.push(new Filter("LIVELLO5", FilterOperator.EQ, value)); // +k
                }fLIVELLO5 = new sap.ui.model.Filter({filters: fLIVELLO5, and: false});
                return fLIVELLO5;
            }

        },
        filterLivello6: function (LIVELLO6) {

            var value = "";
            if (LIVELLO6 === null || LIVELLO6 === undefined || LIVELLO6 === "") {
                return new Filter("LIVELLO6", FilterOperator.EQ, "");
            } else {

                var fLIVELLO6 = [];

                fLIVELLO6.push(new Filter("LIVELLO6", FilterOperator.EQ, LIVELLO6)); // ++
                value = LIVELLO6[0] + "x";
                fLIVELLO6.push(new Filter("LIVELLO6", FilterOperator.EQ, value));
                // +x

                // -> numero
                if (!isNaN(Number(LIVELLO6))) {
                    fLIVELLO6.push(new Filter("LIVELLO6", FilterOperator.EQ, "nn")); // nn
                }

                // 2 -> numero
                if (!isNaN(Number(LIVELLO6[1]))) {
                    value = LIVELLO6[0] + "n";
                    fLIVELLO6.push(new Filter("LIVELLO6", FilterOperator.EQ, value)); // +n
                }fLIVELLO6 = new sap.ui.model.Filter({filters: fLIVELLO6, and: false});
                return fLIVELLO6;

            }
        },
        checkSede: async function (sel) {
            // control Sede Tecnica da lvl 3 a lvl 6
            // n = Numero - k = Alfabetico - x = Alfanumerico
            var aFilter = [];
            aFilter.push(new Filter("SEDE_TECNICA", FilterOperator.EQ, sel.SEDE_TECNICA));
            aFilter.push(new Filter("LIVELLO1", FilterOperator.EQ, sel.LIVELLO1));
            aFilter.push(new Filter("LIVELLO2", FilterOperator.EQ, sel.LIVELLO2));

            aFilter.push(this.filterLivello3(sel.LIVELLO3));
            aFilter.push(this.filterLivello4(sel.LIVELLO4));
            aFilter.push(this.filterLivello5(sel.LIVELLO5));
            aFilter.push(this.filterLivello6(sel.LIVELLO6));

            aFilter.push(new Filter("LANGUAGE", FilterOperator.EQ, "IT")); // fisso IT - todo

            var result = await this._getLine("/Sede", aFilter);
            if (result.SEDE_TECNICA !== undefined) {
                this.DESC_SEDE = result.DESC_SEDE;
                return true;
            } else {
                return false;
            }
        },
        ControlAzione: async function (sData, sIndex) {

            if (sIndex.TIPO_ORDINE !== "M5" && sIndex.TIPO_ORDINE !== "M8" && sIndex.TIPO_ORDINE !== "M9") {
                if ((sData.ZBAU === "" || sData.ZBAU === undefined) && (sData.SEDE_TECNICA === "" || sData.SEDE_TECNICA === undefined)) {
                    return "Inserire o lo ZBAU o la Sede Tecnica";
                }
            }
            if ((sData.ZBAU !== "" && sData.ZBAU !== undefined) && ((sData.SEDE_TECNICA !== "" && sData.SEDE_TECNICA !== undefined) || (sData.SEDE_TECNICA_P !== "" && sData.SEDE_TECNICA_P !== undefined))) {
                return "Inserire o lo ZBAU o la Sede Tecnica";
            }
            var checkSede = true;
            if (sData.SEDE_TECNICA !== "" && sData.SEDE_TECNICA !== undefined) {
                checkSede = await this.checkSede(sData);
                if (! checkSede) {
                    return "Sede Tecnica non valida";
                }
            }
            if (sData.SISTEMA === "" || sData.SISTEMA === undefined) {
                return "Inserire Sistema";
            }
            if (sData.PROGRES === null || sData.PROGRES === undefined || sData.PROGRES === 0) {
                return "Inserire Progressivo";
            }
            if (sData.CLASSE === "" || sData.CLASSE === undefined) {
                return "Inserire Classe";
            }

            var aFilter = [];
            aFilter.push(new Filter("Progres", FilterOperator.EQ, sData.PROGRES));
            aFilter.push(new Filter("Sistema", FilterOperator.EQ, sData.SISTEMA));
            var result = await this._getLinenoError("/T_ACT_PROG", aFilter);
            if (! result) {
                return "Inserire Progressivo correttamente";
            } else {
                this.DESC_PROG = result.Txt;
            }
            return "";

        },
        ControlServizi: async function (sData) {
            var aFilter = [];
            aFilter.push(new Filter("ASNUM", FilterOperator.EQ, sData.ASNUM));
            var result = await this._getLinenoError("/Servizi", aFilter);
            if (! result || result.length === 0) {
                return "Inserire Servizio correttamente";
            }
            return "";
        },
        ControlMateriali: async function (sData) {
            var aFilter = [];
            if (sData.MATNR.length <= 18) {
                aFilter.push(new Filter("MATNR", FilterOperator.EQ, sData.MATNR.padStart(18, "0")));
                var result = await this._getLinenoError("/Materiali", aFilter);
                if (! result || result.length === 0) {
                    return "Inserire Materiale correttamente";
                }
            } else {
                return "Inserire Materiale correttamente";
            }
            return "";
        },
        ControlIndex: function (sData) {

            if (sData.TIPOFREQUENZA === "" || sData.TIPOFREQUENZA === undefined || sData.TIPOFREQUENZA === null) {
                return "Inserire Tipologia Frequenza";
            }
            if (sData.TIPOFREQUENZA === "C") {
                if (sData.MPTYP === "" || sData.MPTYP === undefined) {
                    return "Inserire Punto di Misura";
                }
                if (sData.POINT === "" || sData.POINT === undefined) {
                    return "Inserire Tipologia punto di misura";
                }
                if (sData.FREQ_CICLO === "" || sData.FREQ_CICLO === undefined) {
                    return "Inserire Frequenza Contatore";
                }
                if (sData.UNITA_CICLO === "" || sData.UNITA_CICLO === undefined) {
                    return "Inserire UdM Contatore";
                }
                if (sData.LIMITE === "" || sData.LIMITE === undefined) {
                    return "Inserire Valore limite";
                }
            } else if (sData.TIPOFREQUENZA === "T") {

                if (sData.FREQ_TEMPO === "" || sData.FREQ_TEMPO === undefined) {
                    return "Inserire Frequenza Tempo";
                }
                if (sData.UNITA_TEMPO === "" || sData.UNITA_TEMPO === undefined) {
                    return "Inserire UdM Tempo";
                }
            }
            if (sData.LSTAR === "" || sData.LSTAR === undefined) {
                return "Inserire Tipo Attività (1)";
            }
            if (sData.STEUS === "" || sData.STEUS === undefined) {
                return "Inserire Chiave di Controllo (1)";
            }
            if (sData.NUM === "" || sData.NUM === undefined) {
                return "Inserire Exec factor (1)";
            }
            if (sData.PERSONE === "" || sData.PERSONE === undefined) {
                return "Inserire Quantità Risorse (1)";
            }
            if (sData.HPER === "" || sData.HPER === undefined) {
                return "Inserire Durata (1)";
            }
            if (sData.STRATEGIA === "" || sData.STRATEGIA === undefined) {
                return "Inserire Strategia";
            }
            if (sData.PRIORITA === "" || sData.PRIORITA === undefined || sData.PRIORITA === null) {
                return "Inserire Priorità";
            }
            /*if (sData.TIPO_ORDINE === "M5" || sData.TIPO_ORDINE === "M8" || sData.TIPO_ORDINE === "M9"){
            if (sData.DIVISIONEC === "" || sData.DIVISIONEC === undefined) {
              return "Inserire Divisione Centro di lavoro";
            }
            if (sData.CENTRO_LAVORO === "" || sData.CENTRO_LAVORO === undefined) {
              return "Inserire Centro di lavoro";
            }
          } */
            if (sData.TIPO_GESTIONE === "" || sData.TIPO_GESTIONE === undefined) {
                return "Inserire Tipo Gestione";
            }
            if (sData.TIPO_GESTIONE_1 === "" || sData.TIPO_GESTIONE_1 === undefined) {
                return "Inserire Finalità";
            }
            if (sData.TIPO_GESTIONE_2 === "" || sData.TIPO_GESTIONE_2 === undefined) {
                return "Inserire Gruppo Controlli";
            }
            if (sData.INDISPONIBILITA === "" || sData.TIPO_GESTIONE_2 === undefined) {
                return "Inserire Indisponibilità";
            }

            return "";
        },
        handlePopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            // this.byId("").openBy(oButton);Fragment

            // create popover
            if (!this._pPopover) {
                this._pPopover = Fragment.load({id: oView.getId(), name: "PM030.APP2.fragment.popInfoSede", controller: this}).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });


        },
        _saveHana: function (URL, sData) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve, reject) {
                xsoDataModelReport.create(URL, sData, {
                    success: function (oDataIn) {
                        resolve(oDataIn);
                    },
                    error: function (err) {
                        var responseObject = JSON.parse(err.responseText);
                        reject(MessageBox.error(responseObject.error.message.value));
                    }
                });
            });
        },
        _saveHanaNoError: function (URL, sData) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve, reject) {
                xsoDataModelReport.create(URL, sData, {
                    success: function (oDataIn) {
                        resolve(oDataIn);
                    },
                    error: function (err) {
                        var responseObject = JSON.parse(err.responseText);
                        resolve(responseObject.error.code);
                    }
                });
            });
        },
        _updateHanaNoError: function (sURL, oEntry) {
            var xsoDataModelReport = this.getOwnerComponent().getModel();
            return new Promise(function (resolve, reject) {
                xsoDataModelReport.update(sURL, oEntry, {
                    success: function (oDataIn) {
                        resolve(oDataIn);
                    },
                    error: function (err) {
                        var responseObject = JSON.parse(err.responseText);
                        resolve(responseObject.error.code);
                    }
                });
            });
        },
        _updateHana: function (sURL, oEntry) {
            var xsoDataModelReport = this.getOwnerComponent().getModel();
            return new Promise(function (resolve, reject) {
                xsoDataModelReport.update(sURL, oEntry, {
                    success: function (oDataIn) {
                        resolve(oDataIn);
                    },
                    error: function (err) {
                        var responseObject = JSON.parse(err.responseText);
                        reject(MessageBox.error(responseObject.error.message.value));
                    }
                });
            });
        },
        _removeHana: function (URL) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve) {
                xsoDataModelReport.remove(URL, {
                    success: function () {
                        resolve();
                    },
                    error: function () {
                        resolve();
                    }
                });
            });
        },
        _getLastItemData: function (Entity, Filters, SortBy) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve, reject) {
                xsoDataModelReport.read(Entity, {
                    filters: Filters,
                    sorters: [new Sorter(SortBy, true)],
                    urlParameters: {
                        "$select": SortBy,
                        "$top": 1
                    },
                    success: function (oDataIn) {
                        if (oDataIn.results[0] !== undefined) {
                            if (oDataIn.results[0][SortBy] === null) {
                                resolve(0);
                            } else {
                                resolve(oDataIn.results[0][SortBy]);
                            }
                        } else {
                            resolve(0);
                        }
                    },
                    error: function (err) {
                        var responseObject = JSON.parse(err.responseText);
                        reject(MessageBox.error(responseObject.error.message.value))
                    }
                });
            });
        },
        _getLine: function (Entity, Filters) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve, reject) {
                xsoDataModelReport.read(Entity, {
                    filters: Filters,
                    urlParameters: {
                        "$top": 1
                    },
                    success: function (oDataIn) {
                        if (oDataIn.results[0] !== undefined) {
                            resolve(oDataIn.results[0]);
                        } else {
                            resolve(oDataIn);
                        }
                    },
                    error: function (err) {
                        var responseObject = JSON.parse(err.responseText);
                        reject(MessageBox.error(responseObject.error.message.value))
                    }
                });
            });
        },
        _getLinenoError: function (Entity, Filters) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve) {
                xsoDataModelReport.read(Entity, {
                    filters: Filters,
                    urlParameters: {
                        "$top": 1
                    },
                    success: function (oDataIn) {
                        if (oDataIn.results[0] !== undefined) {
                            resolve(oDataIn.results[0]);
                        } else if (oDataIn.results !== undefined) {
                            resolve(oDataIn.results);
                        } else {
                            resolve(oDataIn);
                        }
                    },
                    error: function () {
                        resolve(undefined);
                    }
                });
            });
        },
        _getTable: function (Entity, Filters) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve, reject) {
                xsoDataModelReport.read(Entity, {
                    filters: Filters,
                    success: function (oDataIn) {
                        if (oDataIn.results !== undefined) {
                            resolve(oDataIn.results);
                        } else {
                            resolve(oDataIn);
                        }
                    },
                    error: function (err) {
                        var responseObject = JSON.parse(err.responseText);
                        reject(MessageBox.error(responseObject.error.message.value))
                    }
                });
            });
        },
        _getTableNoError: function (Entity, Filters) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve, reject) {
                xsoDataModelReport.read(Entity, {
                    filters: Filters,
                    success: function (oDataIn) {
                        if (oDataIn.results !== undefined) {
                            resolve(oDataIn.results);
                        } else {
                            resolve(oDataIn);
                        }
                    },
                    error: function (err) {
                        resolve([]);
                    }
                });
            });
        },
        _getTableIndexAzioni: function (Entity, Filters) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve, reject) {
                xsoDataModelReport.read(Entity, {
                    filters: Filters,
                    sorters: [
                        new Sorter("INDEX", true),
                        new Sorter("CONTATORE", true)
                    ],
                    success: function (oDataIn) {
                        if (oDataIn.results !== undefined) {
                            resolve(oDataIn.results);
                        } else {
                            resolve(oDataIn);
                        }
                    },
                    error: function (err) {
                        var responseObject = JSON.parse(err.responseText);
                        reject(MessageBox.error(responseObject.error.message.value))
                    }
                });
            });
        },
        _getTableIndex: function (Entity, Filters) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve, reject) {
                xsoDataModelReport.read(Entity, {
                    filters: Filters,
                    sorters: [new Sorter("INDEX", true)],
                    success: function (oDataIn) {
                        if (oDataIn.results !== undefined) {
                            resolve(oDataIn.results);
                        } else {
                            resolve(oDataIn);
                        }
                    },
                    error: function (err) {
                        var responseObject = JSON.parse(err.responseText);
                        reject(MessageBox.error(responseObject.error.message.value))
                    }
                });
            });
        },
        _getTableDistinct: function (Entity, Filters, Columns) {
            var xsoDataModelReport = this.getView().getModel();
            return new Promise(function (resolve) {
                xsoDataModelReport.read(Entity, {
                    filters: Filters,
                    urlParameters: {
                        "$select": Columns
                    },
                    success: function (oDataIn) {
                        resolve(oDataIn.results);
                    },
                    error: function () {
                        resolve();
                    }
                });
            });
        }
    });
});
