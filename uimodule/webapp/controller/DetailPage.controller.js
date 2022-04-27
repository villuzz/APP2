sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "PM030/APP2/util/PianiTable",
    "sap/m/TablePersoController",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "PM030/APP2/util/PianiTableAzioni",
], function (Controller, JSONModel, MessageBox, PianiTable, TablePersoController, Filter, FilterOperator, PianiTableAzioni) {
    "use strict";

    return Controller.extend("PM030.APP2.controller.DetailPage", {
        onInit: function () {

            this._oTPCDetail = new TablePersoController({table: this.byId("tAzioni"), componentName: "Azioni", persoService: PianiTableAzioni}).activate();
            this.getOwnerComponent().getRouter().getRoute("DetailPage").attachPatternMatched(this._onObjectMatched, this);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.attachRouteMatched(this.routeMatched, this);

        },
        routeMatched: async function () {
          //this.getView().byId("cbDivisioneC").getModel().setSizeLimit(2000);
          //this.getView().byId("cbDivisioneC").getModel().refresh();
        },
        _onObjectMatched: async function (oEvent) {

          sap.ui.core.BusyIndicator.show(0);

            this.byId("iconTabBar").setSelectedKey(this.byId("iconTabBar").getItems()[0].getId());

            this.getValueHelp(); //PER QUELLI PICCOLI VA BENE, PER GLI ALTRI CHIAMARE SOLO AL BISOGNO TODO

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
            sap.ui.core.BusyIndicator.hide(0);
        },
        getValueHelp: async function(){
          var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            sData.PRIORITA = await this.Shpl("ZPM4R_D_PRIORITA", "FV");
            sData.DIVISIONEC = await this.Shpl("H_T001W", "SH");
            sData.CENTRO_LAVORO = await this.Shpl("ZPM4R_H_DESTINATARIO", "SH");
            sData.TIPO_ORDINE = await this.Shpl("H_T003O", "SH");
            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
        },
        Shpl: async function (ShplName, ShplType) {
            var aFilter = [];
            aFilter.push(new Filter("ShplName", FilterOperator.EQ, ShplName));
            aFilter.push(new Filter("ShplType", FilterOperator.EQ, ShplType));

            var result = await this._getTable("/dySearch", aFilter);
            if (result[0].ReturnFieldValueSet) {
              result = result[0].ReturnFieldValueSet.results;
              result.splice(0,1);
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

            var sIndex = this.IndexModel(this.getView().getModel("sSelect").getData());
            var aAzioni = this.getView().getModel("sSelect").getData().AZIONI;
            var i = 0,
                results,
                sAzioni,
                msg = "";

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
                    } else if (aAzioni[i].DESC_SEDE === "") {
                        aAzioni[i].DESC_SEDE = this.DESC_SEDE;
                    }
                }
            }

            if (msg !== "") {
                MessageBox.error(msg);
            } else { // Creazione
                if (this.selINDEX === undefined) {
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

                        await this._saveHana("/Azioni", sAzioni);
                    }
                } else { // Modifica

                    var sURL = "/Index/" + sIndex.ID;
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
                        sURL = "/Azioni/" + this.delAzioni[i].ID + "/" + this.delAzioni[i].CONTATORE;
                        sAzioni = this.AzioniModel(this.delAzioni[i]);
                        delete sAzioni.SEDE_TECNICA_P;
                        await this._removeHana(sURL, sAzioni);
                    }

                    /*var cont = 0;
                    for (i = 0; i < aAzioni.length; i++) {
                        sAzioni = aAzioni[i];
                        if (sAzioni.CONTATORE !== "New") {
                            if (Number(sAzioni.CONTATORE) >= cont) {
                                cont = Number(sAzioni.CONTATORE) + 1;
                            }
                        }
                    }*/

                    for (i = 0; i < aAzioni.length; i++) {
                        sAzioni = this.AzioniModel(aAzioni[i]);
                        delete sAzioni.SEDE_TECNICA_P;
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
                }


                this.navTo("ViewPage");
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
                        VALORE: ""
                    }
                ]
            };
            return sData;
        }

    });
});
