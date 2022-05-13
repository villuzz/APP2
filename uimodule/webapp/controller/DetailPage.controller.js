sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "PM030/APP2/util/PianiTable",
    "sap/m/TablePersoController",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "PM030/APP2/util/PianiTableAzioni",
    'sap/ui/core/library',
    "PM030/APP2/util/Validator",
], function (Controller, JSONModel, MessageBox, PianiTable, TablePersoController, Filter, FilterOperator, PianiTableAzioni, coreLibrary, Validator) {
    "use strict";

    var ValueState = coreLibrary.ValueState;

    return Controller.extend("PM030.APP2.controller.DetailPage", {
        Validator: Validator,
        onInit: function () {

            this._oTPCDetail = new TablePersoController({table: this.byId("tAzioni"), componentName: "Azioni", persoService: PianiTableAzioni}).activate();
            this.getOwnerComponent().getRouter().getRoute("DetailPage").attachPatternMatched(this._onObjectMatched, this);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.attachRouteMatched(this.routeMatched, this);

        },
        routeMatched: async function () {
            // this.getView().byId("cbDivisioneC").getModel().setSizeLimit(2000);
            // this.getView().byId("cbDivisioneC").getModel().refresh();
        },
        _onObjectMatched: async function (oEvent) {

            sap.ui.core.BusyIndicator.show(0);
            Validator.clearValidation();
            this.byId("iconTabBar").setSelectedKey(this.byId("iconTabBar").getItems()[0].getId());

            var oModel = new sap.ui.model.json.JSONModel();
            var sIndex = {},
                aAzioni = [];

            this.selINDEX = oEvent.getParameter("arguments").ID;
            this.selCOPY = oEvent.getParameter("arguments").COPY;
            this.delAzioni = [];

            this.byId("VIS_FREQ_TEMPO").setVisible(false);
            this.byId("VIS_FREQ_CICLO").setVisible(false);
            if (this.selINDEX === undefined) {
                sIndex = this.initModel();
                oModel.setData(sIndex);
                this.getView().setModel(oModel, "sSelect");
            } else {
                var aFilter = [],
                    oFilter;
                oFilter = new Filter("ID", FilterOperator.EQ, this.selINDEX);
                aFilter.push(oFilter);

                sIndex = await this._getLine("/Index", aFilter);
                if (this.selCOPY !== undefined) {
                    oFilter = new Filter("CONTATORE", FilterOperator.EQ, this.selCOPY);
                    aFilter.push(oFilter);
                }
                sIndex.AZIONI = await this._getTable("/Azioni", aFilter);
                for (var i = 0; i < sIndex.AZIONI.length; i++) {
                    var sel = sIndex.AZIONI[i];
                    var selConcat = sel.LIVELLO1 + '-' + sel.LIVELLO2 + '-' + sel.LIVELLO3 + '-' + sel.LIVELLO4 + '-' + sel.LIVELLO5 + '-' + sel.LIVELLO6;
                    // Evita i - in eccesso in fondo
                    selConcat = selConcat.replaceAll("--", "");
                    if (selConcat[selConcat.length - 1] === "-") {
                        selConcat = selConcat.substring(0, (selConcat.length - 1));
                    }
                    sIndex.AZIONI[i].SEDE_TECNICA_P = selConcat;

                    aFilter = [];
                    aFilter.push(new Filter("INDEX", FilterOperator.EQ, sIndex.INDEX));
                    aFilter.push(new Filter("CONTATORE", FilterOperator.EQ, sIndex.AZIONI[i].CONTATORE));

                    sIndex.AZIONI[i].Material = await this._getTable("/AzioniMateriali", aFilter);
                    sIndex.AZIONI[i].Servizi = await this._getTable("/AzioniServizi", aFilter);
                }
                if (this.selCOPY !== undefined) {
                    this.selINDEX = undefined;
                    sIndex.ID = "New";
                    sIndex.INDEX = "New";
                    for (var i = 0; i < sIndex.AZIONI.length; i++) {
                        sIndex.AZIONI[i].ID = "New";
                        sIndex.AZIONI[i].INDEX = "New";
                        sIndex.AZIONI[i].CONTATORE = "New";
                    }
                }
                switch (sIndex.TIPOFREQUENZA) {
                    case "C":
                        this.byId("VIS_FREQ_CICLO").setVisible(true);
                        break;
                    case "T":
                        this.byId("VIS_FREQ_TEMPO").setVisible(true);
                        break;
                    default:
                        break;
                }
                // sIndex.INDISPONIBILITA = (sIndex.INDISPONIBILITA === "X" ? true : false);
                oModel.setData(sIndex);
                this.getView().setModel(oModel, "sSelect");
            }

            if (this.getView().getModel("sHelp") === undefined) {
                await this.getValueHelp(); // PER QUELLI PICCOLI VA BENE, PER GLI ALTRI CHIAMARE SOLO AL BISOGNO TODO
            }sap.ui.core.BusyIndicator.hide(0);
        },
        getValueHelp: async function () {
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            sData.PRIORITA = await this.Shpl("ZPM4R_D_PRIORITA", "FV");
            sData.TIPO_ORDINE = await this.Shpl("T003O", "CH");
            sData.DIVISIONE = await this.Shpl("H_T001W", "SH");
            sData.STEUS = await this.Shpl("T430", "CH");
            sData.POINT = await this.Shpl("T370P", "CH");
            sData.LSTAR = await this.Shpl("LARTN", "SH");
            //sData.TIPO_ATTIVITA = await this.Shpl("T350I", "CH");
            sData.SEDE_TECNICA = await this._getTableDistinct("/SedeDistinct", [], "SEDE_TECNICA");
            sData.TIPO_GESTIONE = await this._getTableNoError("/T_TP_MAN");
            sData.TIPO_GESTIONE_1 = await this._getTableNoError("/T_TP_MAN1");
            sData.TIPO_GESTIONE_2 = await this._getTableNoError("/T_TP_MAN2");
            sData.CENTRO_LAVORO = await this._getTableNoError("/T_DEST");
            sData.TIPO_ATTIVITA = await this.Shpl("T353I", "CH");
            sData.SISTEMA = await this._getTableNoError("/T_ACT_SYST");
            // sData.PROGRES = await this._getTableNoError("/T_ACT_PROG");
            sData.CLASSE = await this._getTableNoError("/T_ACT_CL");
            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
        },
        onFilterHelp: async function (oEvent) { // sap.ui.core.BusyIndicator.show();
            var sFilter = this.getView().getModel("sSelect").getData();
            var tempFilter = [];
            var aFiltersClass = [],
                aFilterProgress = [],
                aFilterSystem = [];

            /*if (sFilter.DIVISIONEC !== undefined) {
                if (sFilter.DIVISIONEC.length !== 0) {
                    aFiltersClass.push(new Filter("Werks", FilterOperator.EQ, sFilter.DIVISIONEC));
                    aFilterProgress.push(new Filter("Werks", FilterOperator.EQ, sFilter.DIVISIONEC));
                    aFilterSystem.push(new Filter("Werks", FilterOperator.EQ, sFilter.DIVISIONEC));
                }
            }*/

            if (sFilter.SISTEMA !== undefined) {
                if (sFilter.SISTEMA.length !== 0) {
                    aFiltersClass.push(new Filter("Sistema", FilterOperator.EQ, sFilter.SISTEMA));
                    aFilterProgress.push(new Filter("Sistema", FilterOperator.EQ, sFilter.SISTEMA));
                }
            }

            var sHelp = this.getView().getModel("sHelp").getData();

            if (aFilterSystem !== []) {
                sHelp.SISTEMA = await this._getTableNoError("/T_ACT_SYST", aFilterSystem);
            }
            if (aFilterProgress !== []) {
                sHelp.PROGRES = await this._getTableNoError("/T_ACT_PROG", aFilterProgress);
            }
            if (aFiltersClass !== []) {
                sHelp.CLASSE = await this._getTableNoError("/T_ACT_CL", aFiltersClass);
            }

            this.getView().getModel("sHelp").refresh();
            // this.handleChangeCb(oEvent);
            // sap.ui.core.BusyIndicator.hide();
        },

        ProgressSearch: function (oEvent) {

            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Progres", FilterOperator.Contains, sValue);

            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        ProgressClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (! oSelectedItem) {
                return;
            }
            this.lineSelected.PROGRES = oSelectedItem.getTitle();
            this.lineSelected.DESC_PROG = oSelectedItem.getDescription();
            this.getView().getModel("sSelect").refresh();
        },
        onValueHelpProgress: async function (oEvent) { // var sFilter = oEvent.getSource().getBindingContext("sSelect").getObject();
            this.lineSelected = oEvent.getSource().getBindingContext("sSelect").getObject();

            var aFilters = [];
            if (this.lineSelected.DIVISIONE !== undefined && this.lineSelected.DIVISIONE !== "" && this.lineSelected.DIVISIONE !== null) {
                aFilters.push(new Filter("Werks", FilterOperator.EQ, this.lineSelected.DIVISIONE));
            }
            if (this.lineSelected.SISTEMA !== undefined && this.lineSelected.SISTEMA !== "" && this.lineSelected.SISTEMA !== null) {
                aFilters.push(new Filter("Sistema", FilterOperator.EQ, this.lineSelected.SISTEMA));
            }
            var sPROGRES = await this._getTableNoError("/T_ACT_PROG", aFilters);
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setData(sPROGRES);
            this.getView().setModel(oModelHelp, "sProgress");
            this.byId("ProgressHelp").open();
        },

        handleChangeCb: function (oEvent) {
            var oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();

            if (! sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
            }
        },
        handleChangeIn: function (oEvent) {
            var oValidatedInput = oEvent.getSource(),
                sSuggestion = oEvent.getSource().getSuggestionRows(),
                sValue = oValidatedInput.getValue();
            if (!_.contains(sSuggestion, sValue)) {
                oValidatedInput.setValueState(ValueState.Error);
            } else {
                oValidatedInput.setValueState(ValueState.None);
            }
        },
        onChangeProgress: function (oEvent) {
            var descProgress = oEvent.getSource().getSelectedItem().getBindingContext("sHelp").getObject().Txt;
            oEvent.getSource().getBindingContext("sSelect").getObject().DESC_PROG = descProgress;
        },
        Shpl: async function (ShplName, ShplType) {
            var aFilter = [];
            aFilter.push(new Filter("ShplName", FilterOperator.EQ, ShplName));
            aFilter.push(new Filter("ShplType", FilterOperator.EQ, ShplType));

            var result = await this._getTableNoError("/dySearch", aFilter);
            if (result[0] !== undefined) {
                if (result[0].ReturnFieldValueSet) {
                    result = result[0].ReturnFieldValueSet.results;
                    result.splice(0, 1);
                } else {
                    result = [];
                }
            } else {
                result = [];
            }
            return result;
        },
        onPersoButtonPressed: function () {
            this._oTPCDetail.openDialog();
        },
        onCopy: function () {
            sap.ui.core.BusyIndicator.show();
            var sel = this.getView().byId("tAzioni").getSelectedItems();
            for (var i = 0; i < sel.length; i++) {
                var line = JSON.stringify(sel[i].getBindingContext("sSelect").getObject());
                line = JSON.parse(line);
                line.CONTATORE = "New";
                this.getView().getModel("sSelect").getData().AZIONI.push(line);

            }
            this.getView().byId("tAzioni").removeSelections();
            this.getView().getModel("sSelect").refresh();
            sap.ui.core.BusyIndicator.hide();
        },
        onBackConfirm: function () {
            this.navTo("ViewPage");
        },
        onBack: function () {
            var that = this;
            MessageBox.confirm("Tornando indietro perderai le modifiche, Confermi?", {
                styleClass: "sapUiSizeCompact",
                actions: [
                    "Si", sap.m.MessageBox.Action.NO
                ],
                emphasizedAction: "Si",
                initialFocus: sap.m.MessageBox.Action.NO,
                onClose: function (oAction) {
                    if (oAction === "NO") { // that.cancel();
                    } else if (oAction === "Si") {
                        that.onBackConfirm();
                    }
                }
            });
        },
        onAddAE: function () {
            this.getView().getModel("sSelect").getData().AZIONI.push(this.initAzioniModel());
            this.getView().getModel("sSelect").refresh();
        },
        onCancelAE: function () {
            var sel = this.getView().byId("tAzioni").getSelectedItems();
            var AZIONI = this.getView().getModel("sSelect").getData().AZIONI;
            // var deleteRecord = oEvent.getSource().getBindingContext("sSelect").getObject();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = sel[i].getBindingContext("sSelect").getObject();
                this.delAzioni.push(line);
                AZIONI.splice(Number(sel[i].getId().split("-").pop()), 1);
            }
            this.getView().getModel("sSelect").refresh();
            this.getView().byId("tAzioni").removeSelections();
        },
        handleTesto: function (oEvent) {
            this.lineSelected = oEvent.getSource().getBindingContext("sSelect").getObject();
            this.getView().byId("vTextArea").setValue(this.lineSelected.TESTO_ESTESO_P);
            this.byId("popTesto").open();
        },
        onCloseTesto: function () {
            this.byId("popTesto").close();
        },
        onCloseTestoConfirm: function () {
            this.lineSelected.TESTO_ESTESO_P = this.getView().byId("vTextArea").getValue();
            this.getView().getModel("sSelect").refresh();
            this.byId("popTesto").close();
        },
        handleSedeTecnica: function (oEvent) {
            this.onResetSedeTecnica();
            this._sInputId = oEvent.getSource();
            this.byId("DialogSede").open();
        },
        handleSedeTecnicaCancel: function (oEvent) {
            var sSelect = this.getView().getModel("sSelect").getData();
            sSelect.SEDE_TECNICA = "";
            sSelect.LIVELLO1 = "";
            sSelect.LIVELLO2 = "";
            sSelect.LIVELLO3 = "";
            sSelect.LIVELLO4 = "";
            sSelect.LIVELLO5 = "";
            sSelect.LIVELLO6 = "";
            sSelect.DESC_SEDE = "";
            this.getView().getModel("sSelect").refresh();
        },
        onPressSedeTecnica: function (oEvent) {
            var sel = oEvent.getSource().getBindingContext().getObject();
            var selConcat = sel.LIVELLO1 + '-' + sel.LIVELLO2 + '-' + sel.LIVELLO3 + '-' + sel.LIVELLO4 + '-' + sel.LIVELLO5 + '-' + sel.LIVELLO6;
            // Evita i - in eccesso in fondo
            selConcat = selConcat.replaceAll("--", "");
            if (selConcat[selConcat.length - 1] === "-") {
                selConcat = selConcat.substring(0, (selConcat.length - 1));
            }
            this._sInputId.setValue(selConcat);
            this._sInputId.getBindingContext("sSelect").getObject().DESC_SEDE = sel.DESC_SEDE;
            this._sInputId.getBindingContext("sSelect").getObject().SEDE_TECNICA = sel.SEDE_TECNICA;
            this.byId("DialogSede").close();
        },
        onCloseSedeTecnica: function () {
            this._sInputId.setValue(null);
            this.byId("DialogSede").close();
        },
        /*   onPressSedeTecnica: function (oEvent) {
            var sel = oEvent.getSource().getBindingContext().getObject();
            var sSelect = this.getView().getModel("sSelect").getData();
            sSelect.SEDE_TECNICA = sel.SEDE_TECNICA;
            sSelect.LIVELLO1 = sel.LIVELLO1;
            sSelect.LIVELLO2 = sel.LIVELLO2;
            sSelect.LIVELLO3 = sel.LIVELLO3;
            sSelect.LIVELLO4 = sel.LIVELLO4;
            sSelect.LIVELLO5 = sel.LIVELLO5;
            sSelect.LIVELLO6 = sel.LIVELLO6;
            sSelect.DESC_SEDE = sel.DESC_SEDE;
            this.getView().getModel("sSelect").refresh();

            this.byId("DialogSede").close();
        },*/
        onSelStrategia: function (oEvent) {

            var sSelect = this.getView().getModel("sSelect").getData();
            sSelect.STRATEGIA_DESC = oEvent.getSource().getSelectedItem().getBindingContext().getObject().STRATEGIA_DESC;
            sSelect.ID_STRATEGIA = oEvent.getSource().getSelectedItem().getBindingContext().getObject().ID;
            this.getView().getModel("sSelect").refresh();
        },
        handleSavePress: async function () {
            sap.ui.core.BusyIndicator.show();

            var ControlValidate = Validator.validateView();
            if (ControlValidate) {
                var sIndex = this.IndexModel(this.getView().getModel("sSelect").getData());
                var aAzioni = this.getView().getModel("sSelect").getData().AZIONI;
                var i = 0,
                    results,
                    sAzioni,
                    msg = "";
                var line,
                    sURL,
                    j;

                // controllo Dati Indice
                msg = await this.ControlIndex(sIndex);
                if (msg === "") {
                    for (i = 0; i < aAzioni.length; i++) { // controllo Dati Azioni Elementari
                        var aSede = this.AzioniModel(aAzioni[i]);
                        msg = await this.ControlAzione(aSede, sIndex);

                        if (msg !== "") {
                            msg = msg + ", riga n° " + (
                                i + 1
                            );
                            break;
                        }
                        if (aAzioni[i].DESC_SEDE === "") {
                            aAzioni[i].DESC_SEDE = this.DESC_SEDE;
                        }
                        if (aAzioni[i].DESC_PROG === "") {
                          aAzioni[i].DESC_PROG = this.DESC_PROG;
                      }
                    }
                }

                if (msg !== "") {
                    MessageBox.error(msg);
                } else { // Creazione
                    if (this.selINDEX === undefined) {
                        if (aAzioni.length > 0) {
                            delete sIndex.ID;
                            delete sIndex.AZIONI;

                            // get Last Index
                            sIndex.INDEX = await this._getLastItemData("/Index", "", "INDEX");
                            sIndex.INDEX ++;
                            // Testata
                            results = await this._saveHana("/Index", sIndex);

                            for (i = 0; i < aAzioni.length; i++) {
                                sAzioni = this.AzioniModel(aAzioni[i]);
                                delete sAzioni.SEDE_TECNICA_P;
                                sAzioni.ID = results.ID;
                                sAzioni.INDEX = results.INDEX;
                                // sAzioni.CONTATORE = String(i + 1);
                                // get Last Contatore
                                sAzioni.CONTATORE = await this._getLastItemData("/Azioni", "", "CONTATORE");
                                sAzioni.CONTATORE ++;

                                if (sAzioni.Servizi !== undefined) {
                                    for (j = 0; j < sAzioni.Servizi.length; j++) {
                                        line = sAzioni.Servizi[j];
                                        if (line.ASNUM !== "") {
                                            await this._saveHanaNoError("/AzioniServizi", line);
                                        }
                                    }
                                }
                                if (sAzioni.Material !== undefined) {
                                    for (j = 0; j < sAzioni.Material.length; j++) {
                                        line = sAzioni.Material[j];
                                        if (line.MATNR !== "") {
                                            await this._saveHanaNoError("/AzioniMateriali", line);
                                        }
                                    }
                                }
                                delete sAzioni.Servizi;
                                delete sAzioni.Material;

                                await this._saveHana("/Azioni", sAzioni);
                            }
                        }
                    } else { // Modifica


                        aFilter = [];
                        aFilter.push(new Filter("INDEX", FilterOperator.EQ, sIndex.INDEX));

                        var delMaterial = await this._getTable("/AzioniMateriali", aFilter);
                        var delServizi = await this._getTable("/AzioniServizi", aFilter);

                        for (i = 0; i < delMaterial.length; i++) {
                            sURL = "/AzioniMateriali/" + delMaterial[i].INDEX + "/" + delMaterial[i].CONTATORE + "/" + delMaterial[i].MATNR;
                            await this._removeHana(sURL, delMaterial[i]);
                        }
                        for (i = 0; i < delServizi.length; i++) {
                            sURL = "/AzioniServizi/" + delServizi[i].INDEX + "/" + delServizi[i].CONTATORE + "/" + delServizi[i].ASNUM;
                            await this._removeHana(sURL, delServizi[i]);
                        }

                        sURL = "/Index/" + sIndex.ID;
                        delete sIndex.AZIONI;
                        delete sIndex.__metadata;
                        delete sIndex.modifiedBy;
                        delete sIndex.modifiedAt;
                        delete sIndex.createdBy;
                        delete sIndex.createdAt;

                        results = await this._updateHana(sURL, sIndex);

                        // Righe Cancellate
                        for (i = 0; i < this.delAzioni.length; i++) {
                            this.delAzioni[i].ID = sIndex.ID;
                            sAzioni = this.AzioniModel(this.delAzioni[i]);
                            delete sAzioni.SEDE_TECNICA_P;
                            delete sAzioni.Servizi;
                            delete sAzioni.Material;
                            sURL = "/Azioni/" + this.delAzioni[i].ID + "/" + this.delAzioni[i].CONTATORE;
                            await this._removeHana(sURL, sAzioni);
                        }

                        for (i = 0; i < aAzioni.length; i++) {
                            sAzioni = this.AzioniModel(aAzioni[i]);
                            delete sAzioni.SEDE_TECNICA_P;

                            if (sAzioni.Servizi !== undefined) {
                                for (j = 0; j < sAzioni.Servizi.length; j++) {
                                    line = sAzioni.Servizi[j];
                                    if (line.ASNUM !== "") {
                                        delete line.__metadata;
                                        await this._saveHanaNoError("/AzioniServizi", line);
                                    }
                                }
                            }
                            if (sAzioni.Material !== undefined) {
                                for (j = 0; j < sAzioni.Material.length; j++) {
                                    line = sAzioni.Material[j];
                                    if (line.MATNR !== "") {
                                        delete line.__metadata;
                                        await this._saveHanaNoError("/AzioniMateriali", line);
                                    }
                                }
                            }
                            delete sAzioni.Servizi;
                            delete sAzioni.Material;

                            // righe nuove
                            if (sAzioni.CONTATORE === "New") {
                                sAzioni.ID = results.ID;
                                sAzioni.INDEX = results.INDEX;
                                // sAzioni.CONTATORE = String(cont);
                                // cont++;
                                // get Last Contatore
                                sAzioni.CONTATORE = await this._getLastItemData("/Azioni", "", "CONTATORE");
                                sAzioni.CONTATORE ++;

                                await this._saveHana("/Azioni", sAzioni);
                            } else { // righe modificate
                                delete sAzioni.__metadata;
                                delete sAzioni.modifiedBy;
                                delete sAzioni.modifiedAt;
                                delete sAzioni.createdBy;
                                delete sAzioni.createdAt;

                                sAzioni.ID = sIndex.ID;
                                sURL = "/Azioni/" + sAzioni.ID + "/" + sAzioni.CONTATORE;
                                results = await this._updateHana(sURL, sAzioni);
                            }
                        }
                        var aFilter = [];
                        aFilter.push(new Filter("ID", FilterOperator.EQ, sIndex.ID));
                        var result = await this._getLastItemData("/Azioni", aFilter, "INDEX");
                        if (result === 0) {
                            await this._removeHana("/Index/" + sIndex.ID);
                        }
                    }


                    this.navTo("ViewPage");
                }
            }
            sap.ui.core.BusyIndicator.hide(0);

        },
        formatDate: function (sValue) {
            if (sValue === "" || sValue === undefined || sValue === null) {
                return "";
            } else {
                jQuery.sap.require("sap.ui.core.format.DateFormat");
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ // pattern: "MM-y"
                    pattern: "yyyy-MM-dd"
                });

                return oDateFormat.format(new Date(sValue), true);
            }
        },
        onChangetipoFrequenza: function (oEvent) {

            var sSelect = this.getView().getModel("sSelect").getData();

            switch (oEvent.getSource().getSelectedKey()) {
                case "":
                    this.byId("VIS_FREQ_CICLO").setVisible(false);
                    this.byId("VIS_FREQ_TEMPO").setVisible(false);
                    sSelect.FREQ_CICLO = "";
                    sSelect.UNITA_CICLO = "";
                    sSelect.LIMITE = "";
                    sSelect.UNITA_TEMPO = "";
                    sSelect.FREQ_TEMPO = "";
                    break;
                case "C":
                    this.byId("VIS_FREQ_CICLO").setVisible(true);
                    this.byId("VIS_FREQ_TEMPO").setVisible(false);
                    sSelect.UNITA_TEMPO = "";
                    sSelect.FREQ_TEMPO = "";
                    break;
                case "T":
                    this.byId("VIS_FREQ_CICLO").setVisible(false);
                    this.byId("VIS_FREQ_TEMPO").setVisible(true);
                    sSelect.FREQ_CICLO = "";
                    sSelect.UNITA_CICLO = "";
                    sSelect.LIMITE = "";
                    break;
                default:
                    break;
            }
            this.getView().getModel("sSelect").refresh();
        },
        AzioniModel: function (sData) {

            sData.PROGRES = (sData.PROGRES === null ? null : Number(sData.PROGRES));
            sData.CARATT_SEDE = (sData.CARATT_SEDE === null ? null : sData.CARATT_SEDE);
            if (sData.SEDE_TECNICA_P !== undefined) {
                var aSede = sData.SEDE_TECNICA_P.split("-");
                // sData.SEDE_TECNICA = (aSede[0] === undefined ? "" : aSede[0]);
                sData.LIVELLO1 = (aSede[0] === undefined ? "" : aSede[0]);
                sData.LIVELLO2 = (aSede[1] === undefined ? "" : aSede[1]);
                sData.LIVELLO3 = (aSede[2] === undefined ? "" : aSede[2]);
                sData.LIVELLO4 = (aSede[3] === undefined ? "" : aSede[3]);
                sData.LIVELLO5 = (aSede[4] === undefined ? "" : aSede[4]);
                sData.LIVELLO6 = (aSede[5] === undefined ? "" : aSede[5]);
            }
            return sData;
        },
        IndexModel: function (sData) {
            sData.PRIORITA = (sData.PRIORITA === null ? null : Number(sData.PRIORITA));
            sData.FREQ_TEMPO = (sData.FREQ_TEMPO === null ? null : Number(sData.FREQ_TEMPO));
            sData.FREQ_CICLO = (sData.FREQ_CICLO === null ? null : Number(sData.FREQ_CICLO));
            // sData.INDISPONIBILITA = (sData.INDISPONIBILITA === null ? "X" : "");

            return sData;
        },
        initAzioniModel: function () {

            var Azioni = {
                ID: "New",
                CONTATORE: "New",
                ATTIVO: true,
                SISTEMA: "",
                PROGRES: null,
                DESC_PROG: "",
                CLASSE: "",
                DES_COMPONENTE: "",
                DIVISIONE: "",
                SEDE_TECNICA: "",
                LIVELLO1: "",
                LIVELLO2: "",
                LIVELLO3: "",
                LIVELLO4: "",
                LIVELLO5: "",
                LIVELLO6: "",
                DESC_SEDE: "",
                EQUIPMENT: "",
                TESTO_ESTESO_P: "",
                CLASSE_SEDE: "",
                CARATT_SEDE: "",
                OGGETTO_TECNICO: "",
                PROFILO: "",
                ZBAU: "",
                VALORE: ""
            };
            return Azioni;

        },
        initModel: function () {
            var sData = {
                ID: "New",
                ID_STRATEGIA: null,
                STRATEGIA: "",
                STRATEGIA_DESC: "",
                DIVISIONEC: "",
                CENTRO_LAVORO: "",
                TIPO_GESTIONE: "",
                TIPO_GESTIONE_1: "",
                TIPO_GESTIONE_2: "",
                PRIORITA: null,
                TIPO_ATTIVITA: "",
                DESC_BREVE: "",
                TESTO_ESTESO: "",
                INDISPONIBILITA: "",
                TIPO_ORDINE: "",
                LSTAR: "",
                STEUS: "",
                NUM: "",
                LSTAR_1: "",
                STEUS_1: "",
                NUM_1: "",
                LSTAR_2: "",
                STEUS_2: "",
                NUM_2: "",
                LSTAR_3: "",
                STEUS_3: "",
                NUM_3: "",
                LSTAR_4: "",
                STEUS_4: "",
                NUM_4: "",
                LSTAR_5: "",
                STEUS_5: "",
                NUM_5: "",
                RISK: "",
                LIMITE: "",
                FREQ_TEMPO: null,
                UNITA_TEMPO: "",
                FREQ_CICLO: null,
                UNITA_CICLO: "",
                POINT: "",
                MPTYP: "",
                AZIONI: [
                    {
                        ID: "New",
                        CONTATORE: "New",
                        ATTIVO: true,
                        SISTEMA: "",
                        PROGRES: null,
                        DESC_PROG: "",
                        CLASSE: "",
                        DES_COMPONENTE: "",
                        DIVISIONE: "",
                        SEDE_TECNICA: "",
                        LIVELLO1: "",
                        LIVELLO2: "",
                        LIVELLO3: "",
                        LIVELLO4: "",
                        LIVELLO5: "",
                        LIVELLO6: "",
                        DESC_SEDE: "",
                        EQUIPMENT: "",
                        TESTO_ESTESO_P: "",
                        CLASSE_SEDE: "",
                        CARATT_SEDE: "",
                        OGGETTO_TECNICO: "",
                        PROFILO: "",
                        ZBAU: "",
                        VALORE: "",
                        Servizi: [],
                        Material: []
                    }
                ]
            };
            return sData;
        },
        handleMaterial: function (oEvent) {
            this.lineSelected = oEvent.getSource().getBindingContext("sSelect").getObject();
            if (this.lineSelected.Material === undefined) {
                this.lineSelected.Material = [];
            }
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(this.lineSelected.Material);
            this.setModel(oModel, "aMaterial");

            this.byId("popMateriali").open();
        },
        onConfirmMatnr: function () {
            this.lineSelected.Material = this.getView().getModel("aMaterial").getData();
            this.getView().getModel("sSelect").refresh();
            this.byId("popMateriali").close();
        },
        onCloseMatnr: function () {
            this.byId("popMateriali").close();
        },
        onAddMatnr: function () {
            this.getView().getModel("aMaterial").getData().push(this.initMaterial());
            this.getView().getModel("aMaterial").refresh();
        },
        onCancelMatnr: function (oEvent) {
            var MATNR = this.getView().getModel("aMaterial").getData();
            var deleteRecord = oEvent.getSource().getBindingContext("aMaterial").getObject();
            for (var i = 0; i < MATNR.length; i++) {
                if (MATNR[i] === deleteRecord) {
                    MATNR.splice(i, 1);
                    this.getView().getModel("aMaterial").refresh();
                    break;
                }
            }
        },
        initMaterial: function () {
            return {
                INDEX: this.lineSelected.INDEX,
                CONTATORE: this.lineSelected.CONTATORE,
                MATNR: "",
                MAKTX: "",
                MENGE: null,
                MEINS: ""
            };
        },
        handleServizi: function (oEvent) {
            this.lineSelected = oEvent.getSource().getBindingContext("sSelect").getObject();
            if (this.lineSelected.Servizi === undefined) {
                this.lineSelected.Servizi = [];
            }
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(this.lineSelected.Servizi);
            this.setModel(oModel, "aServizi");

            this.byId("popServizi").open();
        },
        onConfirmServizi: function () {
            this.lineSelected.Servizi = this.getView().getModel("aServizi").getData();
            this.getView().getModel("sSelect").refresh();
            this.byId("popServizi").close();
        },
        onCloseServizi: function () {
            this.byId("popServizi").close();
        },
        onAddServizi: function () {
            this.getView().getModel("aServizi").getData().push(this.initServizi());
            this.getView().getModel("aServizi").refresh();
        },
        onCancelServizi: function (oEvent) {
            var SERVIZI = this.getView().getModel("aServizi").getData();
            var deleteRecord = oEvent.getSource().getBindingContext("aServizi").getObject();
            for (var i = 0; i < SERVIZI.length; i++) {
                if (SERVIZI[i] === deleteRecord) {
                    debugger
                    SERVIZI.splice(i, 1);
                    this.getView().getModel("aServizi").refresh();
                    break;
                }
            }
        },
        initServizi: function () {
            return {
                INDEX: this.lineSelected.INDEX,
                CONTATORE: this.lineSelected.CONTATORE,
                ASNUM: "",
                ASKTX: "",
                MENGE: null,
                MEINS: ""
            };

        }

    });
});
