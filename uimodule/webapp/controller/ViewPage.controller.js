sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "PM030/APP2/util/PianiTable",
    "sap/m/TablePersoController",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "PM030/APP2/util/xlsx",
    "PM030/APP2/util/ExcelDownload",
    'sap/m/MessageToast'
], function (Controller, JSONModel, MessageBox, PianiTable, TablePersoController, Filter, FilterOperator, Spreadsheet, exportLibrary, xlsx, UtilExcel, MessageToast) {
    "use strict";
    var EdmType = exportLibrary.EdmType;

    return Controller.extend("PM030.APP2.controller.ViewPage", {
        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("ViewPage").attachPatternMatched(this._onObjectMatched, this);
            this._mViewSettingsDialogs = {};
            this._oTPC = new TablePersoController({table: this.byId("tbPiani"), componentName: "Piani", persoService: PianiTable}).activate();

            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.attachRouteMatched(this.routeMatched, this);
        },
        _onObjectMatched: async function () {
            var sData = {};
            var oModel = new sap.ui.model.json.JSONModel();
            sData.SISTEMA = await this._getTableDistinct("/Index_Azioni", [], "SISTEMA");
            sData.PROGRES = await this._getTableDistinct("/Index_Azioni", [], "PROGRES");
            sData.CLASSE = await this._getTableDistinct("/Index_Azioni", [], "CLASSE");
            oModel.setData(sData);
            this.getView().setModel(oModel, "sHelp");

            this.onSearch();
        },
        routeMatched: async function () {
            // this.getView().byId("tSedeTecnica").getModel().setSizeLimit(200);
            // this.getView().byId("selSede").getModel().setSizeLimit(500);
            this.getView().byId("selLvl1").getModel().setSizeLimit(500);
            this.getView().byId("selLvl2").getModel().setSizeLimit(500);
            this.getView().byId("selLvl3").getModel().setSizeLimit(500);
            this.getView().byId("selLvl4").getModel().setSizeLimit(500);
            this.getView().byId("selLvl5").getModel().setSizeLimit(1000);
            this.getView().byId("selLvl6").getModel().setSizeLimit(1000);
        },
        onPersoButtonPressed: function () {
            this._oTPC.openDialog();
        },
        onListVariant: function () {
            // var oBinding = this.byId("tableVariant").getBinding("items");
            // oBinding.filter().refresh();
            // this.getModel("/Project_variantSet").refresh();
            this.byId("DialogVariantList").open();
        },
        onPressVariant: function () {
            this.getView().byId("VariantName").setValue("");
            this.byId("DialogVariant").open();
        },
        onSaveVariant: async function () {
            if (this.getView().byId("VariantName").getValue() === "") {
                MessageToast.show("Inserire un Nome");
            } else {

                var vColumn = [],
                    vFilter = {};
                var aSel = this._oTPC._oPersonalizations.aColumns;
                for (var i = 0; i < aSel.length; i++) {
                    vColumn.push(aSel[i].visible);
                }
                vColumn = JSON.stringify(vColumn);
                vFilter = JSON.stringify(this.getView().getModel("sFilter").getData());
                var sVariant = {
                    APP: "2",
                    TABLE: "Index",
                    USER: "Test",
                    NAME: this.getView().byId("VariantName").getValue(),
                    COLUMN: vColumn,
                    FILTER: vFilter
                };
                await this._saveHana("/Variante", sVariant);
                this.byId("DialogVariant").close();
            }
        },
        onCloseVariant: function () {
            this.byId("DialogVariant").close();
        },
        onDeleteVariantList: async function (oEvent) {
            sap.ui.core.BusyIndicator.show();
            var line = oEvent.getSource().getBindingContext().getObject();
            var sURL = "/Variante(" + "APP=" + "'" + line.APP + "'," + "TABLE=" + "'" + line.TABLE + "'," + "USER=" + "'" + line.USER + "'," + "NAME=" + "'" + line.NAME + "'" + ")";

            await this._removeHana(sURL);
            sap.ui.core.BusyIndicator.hide();
        },
        onVariantPress: function (oEvent) {
            var line = oEvent.getSource().getBindingContext().getObject();

            var aSel = JSON.parse(line.COLUMN);
            for (var i = 0; i < aSel.length; i++) {
                this._oTPC._oPersonalizations.aColumns[i].visible = aSel[i];
            }
            this.getView().getModel("sFilter").setData(JSON.parse(line.FILTER));
            this._oTPC.refresh();

            this.onSearch();

            this.byId("DialogVariantList").close();
        },
        onCloseVariantList: function () {
            this.byId("DialogVariantList").close();
        },
        handleSedeTecnica: function (oEvent) {

            this.onResetSedeTecnica();
            this._sInputId = oEvent.getSource();
            this.byId("DialogSede").open();

        },
        onCloseSedeTecnica: function () {
            this._sInputId.setValue(null);
            this.byId("DialogSede").close();
        },
        onCloseAzioni: function () {
            this.byId("popAzioni").close();
        },
        handleTesto: function (oEvent) {
            this.lineSelected = oEvent.getSource().getBindingContext("allIndex").getObject();
            this.getView().byId("vTextArea").setText(this.lineSelected.TESTO_ESTESO_P);
            this.byId("popTesto").open();
        },
        handleTesto2: function (oEvent) {
            this.lineSelected = oEvent.getSource().getBindingContext("allIndex").getObject();
            this.getView().byId("vTextArea").setText(this.lineSelected.TESTO_ESTESO);
            this.byId("popTesto").open();
        },
        onCloseTesto: function () {
            this.byId("popTesto").close();
        },
        onChangeAttivo: function (oEvent) {
            this.lineSelected = oEvent.getSource().getBindingContext("allIndex").getObject();
            var that = this;
            var Source = oEvent.getSource();
            MessageBox.confirm("Confermi l operazione di cambio stato? ", {
                styleClass: "sapUiSizeCompact",
                actions: [
                    "Si", sap.m.MessageBox.Action.NO
                ],
                emphasizedAction: "Si",
                initialFocus: sap.m.MessageBox.Action.NO,
                onClose: function (oAction) {
                    if (oAction === "NO") {
                        Source.setState(! Source.getState());
                    } else if (oAction === "Si") {
                        that.onChangeAttivoConfirm();
                    }
                }
            });
        },
        onChangeAttivoConfirm: async function () {
            this.lineSelected
            var sAzioni = {
                ID: this.lineSelected.ID,
                CONTATORE: this.lineSelected.CONTATORE,
                ATTIVO: this.lineSelected.ATTIVO
            };

            var sURL = "/Azioni/" + sAzioni.ID + "/" + sAzioni.CONTATORE;
            await this._updateHana(sURL, sAzioni);
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
            this.byId("DialogSede").close();
        },
        handleUploadPiani: function () { // this.byId("fileUploader").setValue("");
            this.byId("UploadPiani").open();
        },
        onCloseFileUpload: function () {
            this.onSearch();
            this.byId("UploadPiani").close();
        },
        onClearFilter: async function () {
            this.getView().getModel("sFilter").setData({});
            this.onFilterHelp();
        },
        onFilterHelp: async function () {

            var aFiltersClass = [],
                aFilterProgress = [],
                aFilterSystem = [];
            var sFilter = this.getView().getModel("sFilter").getData();
            var tempFilter = [];

            if (sFilter.SISTEMA !== undefined) {
                if (sFilter.SISTEMA.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.SISTEMA, "SISTEMA");
                    aFiltersClass = aFiltersClass.concat(tempFilter);
                    aFilterProgress = aFilterProgress.concat(tempFilter);
                }
            }
            if (sFilter.CLASSE !== undefined) {
                if (sFilter.CLASSE.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.CLASSE, "CLASSE");
                    aFilterProgress = aFilterProgress.concat(tempFilter);
                    aFilterSystem = aFilterSystem.concat(tempFilter);
                }
            }
            if (sFilter.PROGRES !== undefined) {
                if (sFilter.PROGRES.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.PROGRES, "PROGRES");
                    aFiltersClass = aFiltersClass.concat(tempFilter);
                    aFilterSystem = aFilterSystem.concat(tempFilter);
                }
            }

            var sHelp = this.getView().getModel("sHelp").getData();
            if (aFilterSystem !== []) {
                sHelp.SISTEMA = await this._getTableDistinct("/Index_Azioni", aFilterSystem, "SISTEMA");
            }
            if (aFilterProgress !== []) {
                sHelp.PROGRES = await this._getTableDistinct("/Index_Azioni", aFilterProgress, "PROGRES");
            }
            if (aFiltersClass !== []) {
                sHelp.CLASSE = await this._getTableDistinct("/Index_Azioni", aFiltersClass, "CLASSE");
            }
            this.getView().getModel("sHelp").refresh();

        },
        filterSedeTecnica: function (sFilter, aFilters) {

            var oFilter = {};
            if (sFilter.SEDE_TECNICA != "" && sFilter.SEDE_TECNICA != null) {
                var aSede = sFilter.SEDE_TECNICA.split("-");

                if (aSede[0] !== undefined && aSede[0] !== "") {
                    oFilter = new Filter("LIVELLO1", FilterOperator.EQ, aSede[0]);
                    aFilters.push(oFilter);
                } else if (! sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO1", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
                if (aSede[1] !== undefined && aSede[1] !== "") {
                    oFilter = new Filter("LIVELLO2", FilterOperator.EQ, aSede[1]);
                    aFilters.push(oFilter);
                } else if (! sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO2", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
                if (aSede[2] !== undefined && aSede[2] !== "") {
                    oFilter = new Filter("LIVELLO3", FilterOperator.EQ, aSede[2]);
                    aFilters.push(oFilter);
                } else if (! sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO3", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
                if (aSede[3] !== undefined && aSede[3] !== "") {
                    oFilter = new Filter("LIVELLO4", FilterOperator.EQ, aSede[3]);
                    aFilters.push(oFilter);
                } else if (! sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO4", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
                if (aSede[4] !== undefined && aSede[4] !== "") {
                    oFilter = new Filter("LIVELLO5", FilterOperator.EQ, aSede[4]);
                    aFilters.push(oFilter);
                } else if (! sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO5", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
                if (aSede[5] !== undefined && aSede[5] !== "") {
                    oFilter = new Filter("LIVELLO6", FilterOperator.EQ, aSede[5]);
                    aFilters.push(oFilter);
                } else if (! sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO6", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
            }
            return aFilters;
        },
        onSearch: async function () {
            sap.ui.core.BusyIndicator.show();

            var aFilters = [];
            var oFilter = {};

            var sFilterHelp = [];
            var sFilter = this.getView().getModel("sFilter").getData();
            var tempFilter = [];

            aFilters = this.filterSedeTecnica(sFilter, aFilters);


            if (sFilter.INDEX !== undefined) {
                if (sFilter.INDEX.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.INDEX, "INDEX");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.CONTATORE !== undefined) {
                if (sFilter.CONTATORE.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.CONTATORE, "CONTATORE");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.STRATEGIA !== undefined) {
                if (sFilter.STRATEGIA.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.STRATEGIA, "STRATEGIA");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.ATTIVO !== "0" && sFilter.ATTIVO !== undefined) {
                oFilter = new Filter("ATTIVO", FilterOperator.EQ, sFilter.ATTIVO);
                aFilters.push(oFilter);
            }
            if (sFilter.SISTEMA !== undefined) {
                if (sFilter.SISTEMA.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.SISTEMA, "SISTEMA");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.CLASSE !== undefined) {
                if (sFilter.CLASSE.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.CLASSE, "CLASSE");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.PROGRES !== undefined) {
                if (sFilter.PROGRES.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.PROGRES, "PROGRES");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

            var oModel = new sap.ui.model.json.JSONModel(),
                allIndex;

            allIndex = await this._getTableIndexAzioni("/Index_Azioni", aFilters);

            var colorToSet = "W",
                vIndex = "";

            for (var i = 0; i < allIndex.length; i++) {
                var selConcat = allIndex[i].LIVELLO1 + '-' + allIndex[i].LIVELLO2 + '-' + allIndex[i].LIVELLO3 + '-' + allIndex[i].LIVELLO4 + '-' + allIndex[i].LIVELLO5 + '-' + allIndex[i].LIVELLO6;
                // Evita i - in eccesso in fondo
                selConcat = selConcat.replaceAll("--", "");
                if (selConcat[selConcat.length - 1] === "-") {
                    selConcat = selConcat.substring(0, (selConcat.length - 1));
                }
                allIndex[i].SEDE_TECNICA_P = selConcat;

                allIndex[i].CHECK_CHECKBOX = false;
                allIndex[i].DISPLAY_CHECKBOX = false;
                if (allIndex[i].ID !== vIndex && vIndex !== "") {
                    allIndex[i].DISPLAY_CHECKBOX = true;
                    if (colorToSet === "W") {
                        colorToSet = String("G");
                    } else {
                        colorToSet = String("W");
                    }
                }
                if (vIndex === "") {
                    allIndex[i].DISPLAY_CHECKBOX = true;
                }
                allIndex[i].COLORSET = colorToSet;
                vIndex = allIndex[i].ID;
            }

            oModel.setData(allIndex);
            this.getView().setModel(oModel, "allIndex");

            var persoColumn = PianiTable._oBundle.aColumns;
            for (i = 0; i < persoColumn.length; i++) {
                if (persoColumn[i].group === "Azioni") {
                    persoColumn[i].visible = false;
                }
            }
            this._oTPC.refresh();
            sap.ui.core.BusyIndicator.hide(0);
        },
        multiFilterNumber: function (aArray, vName) {

            var aFilter = [];
            if (aArray.length === 0) {
                return new Filter(vName, FilterOperator.EQ, "");
            } else if (aArray.length === 1) {
                return new Filter(vName, FilterOperator.EQ, Number(aArray[0]));
            } else {
                for (var i = 0; i < aArray.length; i++) {
                    aFilter.push(new Filter(vName, FilterOperator.EQ, Number(aArray[i])));
                }
                return aFilter;
            }
        },
        multiFilterText: function (aArray, vName) {

            var aFilter = [];
            if (aArray.length === 0) {
                return new Filter(vName, FilterOperator.EQ, "");
            } else if (aArray.length === 1) {
                return new Filter(vName, FilterOperator.EQ, aArray[0]);
            } else {
                for (var i = 0; i < aArray.length; i++) {
                    aFilter.push(new Filter(vName, FilterOperator.EQ, aArray[i]));
                }
                return aFilter;
            }
        },
        handleDelete: async function () {
            // Pulisci Azioni
            /*   var aFilter = [];
          aFilter.push(new Filter("INDEX", FilterOperator.EQ, null));

          var pippo = await this._getTable("/Azioni", aFilter);
          for (var i = 0; i < pippo.length; i++) {
            await this._removeHana("/Azioni/" + pippo[i].ID + "/" + pippo[i].CONTATORE);
          }*/
            sap.ui.core.BusyIndicator.show();
            var items = this.getView().byId("tbPiani").getSelectedItems();
            if (items.length > 0) {
                for (var i = 0; i < items.length; i++) {
                    var line = items[i].getBindingContext("allIndex").getObject();
                    await this._removeHana("/Azioni/" + line.ID + "/" + line.CONTATORE);

                    var aFilter = [];
                    aFilter.push(new Filter("ID", FilterOperator.EQ, line.ID));
                    var result = await this._getLastItemData("/Azioni", aFilter, "INDEX");
                    if (result === 0) {
                        await this._removeHana("/Index/" + line.ID);
                    }
                }
                this.onSearch();
            } else {
                MessageToast.show("Seleziona una riga");
            }
            sap.ui.core.BusyIndicator.hide();
            /*
            var items = this.getModel("allIndex").getData();

            for (var i = 0; i < items.length; i++) {
                if (items[i].CHECK_CHECKBOX === true) {
                    var selIndex = items[i].ID;
                    await this._removeHana("/Index/" + selIndex);
                    for (var j = 0; j < items.length; j++) {
                        if (items[i].ID === items[j].ID) {
                            var selAzione = items[j].CONTATORE;
                            await this._removeHana("/Azioni/" + selIndex + "/" + selAzione);
                        }
                    }
                }
            }
            this.onSearch();*/
        },
        handleDeleteAnnulla: async function () {
            this.byId("myPopover").close();
        },
        handleNuovo: function () {
            sap.ui.core.BusyIndicator.show();
            this.navTo("DetailPage");

        },
        onPressLine: async function (oEvent) {

            var aFilter = [],
                oFilter;
            oFilter = new Filter("ID", FilterOperator.EQ, oEvent.getSource().getBindingContext("allIndex").getObject().ID);
            aFilter.push(oFilter);

            var oModel = new sap.ui.model.json.JSONModel();
            var result = await this._getTable("/Azioni", aFilter);
            if (!Array.isArray(result)) {
                result = [result];
            }
            oModel.setData(result);
            this.getView().setModel(oModel, "Azioni");

            this.byId("popAzioni").open();
        },
        onUpload: function (e) {
            this._import(e.getParameter("files") && e.getParameter("files")[0]);
        },
        _import: function (file) {
            var oResource = this.getResourceBundle();
            var that = this;
            var oMainModel = new sap.ui.model.json.JSONModel();
            var oMainModel1 = new sap.ui.model.json.JSONModel();
            var oMainModel2 = new sap.ui.model.json.JSONModel();
            var oMainModel3 = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oMainModel, "uploadIndici");
            this.getView().setModel(oMainModel1, "uploadAzioni");
            this.getView().setModel(oMainModel2, "uploadMaterial");
            this.getView().setModel(oMainModel3, "uploadServizi");
            var excelData = {};
            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {type: 'binary'});
                    workbook.SheetNames.forEach(function (sheetName) { // Here is your object for every sheet in workbook
                        excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        if (excelData.length > 0) {
                            switch (sheetName) {
                                case oResource.getText("IndiciExcel"): that.getView().getModel("uploadIndici").setData(excelData);
                                    that.getView().getModel("uploadIndici").refresh(true);
                                    break;
                                case oResource.getText("AzioniExcel"): that.getView().getModel("uploadAzioni").setData(excelData);
                                    that.getView().getModel("uploadAzioni").refresh(true);
                                    break;
                                case oResource.getText("MaterialiExcel"): that.getView().getModel("uploadMaterial").setData(excelData);
                                    that.getView().getModel("uploadMaterial").refresh(true);
                                    break;
                                case oResource.getText("ServiziExcel"): that.getView().getModel("uploadServizi").setData(excelData);
                                    that.getView().getModel("uploadServizi").refresh(true);
                                    break;
                                default:
                                    break;
                            }
                        }
                    });
                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsBinaryString(file);
            }
        },
        checkStrategia: function (sel) {
            var items = this.byId("cbSTRATEGIA").getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].getBindingContext().getObject().STRATEGIA === sel.STRATEGIA) {
                    return items[i].getBindingContext().getObject();
                }
            }
            return "";
        },
        handleUploadPress: async function () {
            var oResource = this.getResourceBundle();

            if (this.getView().byId("fileUploader").getValue() === "") {
                MessageBox.warning("Inserire un File da caricare");
            } else {
                sap.ui.core.BusyIndicator.show();
                var sURL,
                    results,
                    msg = "";
                var aIndiciTemp = this.getView().getModel("uploadIndici").getData();
                var aAzioniTemp = this.getView().getModel("uploadAzioni").getData();
                var aMaterialTemp = this.getView().getModel("uploadMaterial").getData();
                var aServiziTemp = this.getView().getModel("uploadServizi").getData();
                var sIndex = {},
                    sAzione = {},
                    aIndex = [],
                    aAzione = [],
                    sMaterial = {},
                    aMaterial = [],
                    sServizi = {},
                    aServizi = [];

                var k;

                // Formatta dati arrivati da Excel
                for (var i = 0; i < aIndiciTemp.length; i++) {
                    sIndex = this.IndexModel(aIndiciTemp[i]);
                    aIndex.push(sIndex);
                    // Append Indici

                    // Check Indice
                    msg = await this.ControlIndex(sIndex);
                    // Strategia
                    var checkStrategia = await this.checkStrategia(sIndex);
                    if (checkStrategia === "") {
                        msg = "Campo Strategia inserito erroneamente";
                    }

                    if (msg !== "") {
                        msg = msg + ", Indici riga Excel n° " + (
                            i + 2
                        );
                        break;
                    }
                    for (var j = 0; j < aAzioniTemp.length; j++) {
                        sAzione = this.AzioniModel(aAzioniTemp[j]);
                        if (sIndex.INDEX === sAzione.INDEX) {
                            aAzione.push(sAzione);
                            // Append Azioni
                            // Check Azioni
                            msg = await this.ControlAzione(sAzione, sIndex);
                            if (msg !== "") {
                                msg = msg + ", Azioni riga n° Excel " + (
                                    j + 2
                                );
                                break;
                            }
                            if (sAzione.DESC_SEDE === undefined) {
                                sAzione.DESC_SEDE = this.DESC_SEDE;
                            }
                            if (sAzione.DESC_PROG === "") {
                              sAzione.DESC_PROG = this.DESC_PROG;
                            }

                            // Append Material Servizi

                            for (k = 0; k < aMaterialTemp.length; k++) {
                                sMaterial = this.MaterialModel(aMaterialTemp[k]);
                                if (sMaterial.CONTATORE === sAzione.CONTATORE) {
                                    sMaterial.INDEX = sAzione.INDEX;
                                    aMaterial.push(sMaterial);
                                    msg = await this.ControlMateriali(sMaterial);
                                    if (msg !== "") {
                                        msg = msg + ", Materiali riga n° Excel " + (
                                            k + 2
                                        );
                                        break;
                                    }
                                }
                            }
                            for (k = 0; k < aServiziTemp.length; k++) {
                                sServizi = this.ServiziModel(aServiziTemp[k]);
                                if (sServizi.CONTATORE === sAzione.CONTATORE) {
                                    sServizi.INDEX = sAzione.INDEX;
                                    aServizi.push(sServizi);
                                    msg = await this.ControlServizi(sServizi);
                                    if (msg !== "") {
                                        msg = msg + ", Servizi riga n° Excel " + (
                                            k + 2
                                        );
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (msg !== "") {
                        break;
                    }
                }

                // Fine Controlli - Inizio Salvataggio
                if (msg !== "") {
                    sap.ui.core.BusyIndicator.hide(0);
                    MessageBox.error(msg);
                } else {

                    for (i = 0; i < aIndex.length; i++) {
                        var sIndex = aIndex[i];

                        var CurrentIndex = sIndex.INDEX.toString();
                        // ID Strategia
                        var selStrategia = await this.checkStrategia(sIndex);
                        sIndex.ID_STRATEGIA = selStrategia.ID_STRATEGIA;
                        sIndex.STRATEGIA_DESC = selStrategia.STRATEGIA_DESC;

                        // Testata Nuova
                        if (sIndex.INDEX.startsWith("C-")) {
                            sIndex.INDEX = await this._getLastItemData("/Index", "", "INDEX");
                            sIndex.INDEX ++;
                            results = await this._saveHana("/Index", sIndex);
                            sIndex.ID = results.ID;
                        } else { // Testata Modifica
                            var aFilter = [];
                            aFilter.push(new Filter("INDEX", FilterOperator.EQ, sIndex.INDEX));
                            sIndex.ID = await this._getLastItemData("/Index", aFilter, "ID");
                            sIndex.INDEX = Number(sIndex.INDEX);
                            sURL = "/Index/" + sIndex.ID;
                            results = await this._updateHana(sURL, sIndex);
                        }

                        for (var j = 0; j < aAzione.length; j++) {
                            sAzione = aAzione[j];
                            if (CurrentIndex === sAzione.INDEX) {
                                var CurrentAzione = sAzione.CONTATORE.toString();
                                sAzione.ID = results.ID;
                                sAzione.INDEX = results.INDEX;
                                if (sAzione.SEDE_TECNICA === "") {
                                    sAzione.LIVELLO1 = "";
                                    sAzione.LIVELLO2 = "";
                                    sAzione.LIVELLO3 = "";
                                    sAzione.LIVELLO4 = "";
                                    sAzione.LIVELLO5 = "";
                                    sAzione.LIVELLO6 = "";
                                    sAzione.DESC_SEDE = "";
                                }
                                // Posizione Nuova
                                if (sAzione.CONTATORE.startsWith("C-")) {
                                    sAzione.CONTATORE = await this._getLastItemData("/Azioni", "", "CONTATORE");
                                    sAzione.CONTATORE++;
                                    await this._saveHana("/Azioni", sAzione);
                                } else { // Posizione Modifica
                                    sAzione.CONTATORE = Number(sAzione.CONTATORE);
                                    sURL = "/Azioni/" + sAzione.ID + "/" + sAzione.CONTATORE;
                                    await this._updateHana(sURL, sAzione);
                                }
                                for (k = 0; k < aMaterial.length; k++) {
                                    if (CurrentAzione === aMaterial[k].CONTATORE) {
                                        aMaterial[k].CONTATORE = sAzione.CONTATORE;
                                        aMaterial[k].INDEX = sAzione.INDEX;
                                        sURL = "/AzioniMateriali/" + aMaterial[k].INDEX + "/" + aMaterial[k].CONTATORE + "/" + aMaterial[k].MATNR;
                                        await this._updateHana(sURL, aMaterial[k]);
                                    }
                                }
                                for (k = 0; k < aServizi.length; k++) {
                                    if (CurrentAzione === aServizi[k].CONTATORE) {
                                        aServizi[k].CONTATORE = sAzione.CONTATORE;
                                        aServizi[k].INDEX = sAzione.INDEX;
                                        sURL = "/AzioniServizi/" + aServizi[k].INDEX + "/" + aServizi[k].CONTATORE + "/" + aServizi[k].ASNUM;
                                        await this._updateHana(sURL, aServizi[k]);
                                    }
                                }


                            }
                        }

                    }

                    MessageBox.success("Excel Caricato con successo");
                    sap.ui.core.BusyIndicator.hide(0);
                    this.onSearch();
                    this.byId("UploadPiani").close();
                }
            }
        },
        MaterialModel: function (sValue) {
            var oResource = this.getResourceBundle();
            var sData = {};
            sData.CONTATORE = (sValue[oResource.getText("CONTATORE").replaceAll(" ", "_")] === undefined) ? "" : sValue[oResource.getText("CONTATORE").replaceAll(" ", "_")].toString();
            sData.MATNR = (sValue[oResource.getText("MATNR").replaceAll(" ", "_")] === undefined) ? "" : sValue[oResource.getText("MATNR").replaceAll(" ", "_")].toString();
            sData.MENGE = (sValue[oResource.getText("MENGE").replaceAll(" ", "_")] === undefined) ? "" : sValue[oResource.getText("MENGE").replaceAll(" ", "_")].toString();
            sData.MEINS = (sValue[oResource.getText("MEINS").replaceAll(" ", "_")] === undefined) ? "" : sValue[oResource.getText("MEINS").replaceAll(" ", "_")].toString();
            return sData;
        },
        ServiziModel: function (sValue) {
            var oResource = this.getResourceBundle();
            var sData = {};
            sData.CONTATORE = (sValue[oResource.getText("CONTATORE").replaceAll(" ", "_")] === undefined) ? "" : sValue[oResource.getText("CONTATORE").replaceAll(" ", "_")].toString();
            sData.ASNUM = (sValue[oResource.getText("ASNUM").replaceAll(" ", "_")] === undefined) ? "" : sValue[oResource.getText("ASNUM").replaceAll(" ", "_")].toString();
            sData.MENGE = (sValue[oResource.getText("MENGE").replaceAll(" ", "_")] === undefined) ? "" : sValue[oResource.getText("MENGE").replaceAll(" ", "_")].toString();
            sData.MEINS = (sValue[oResource.getText("MEINS").replaceAll(" ", "_")] === undefined) ? "" : sValue[oResource.getText("MEINS").replaceAll(" ", "_")].toString();
            return sData;
        },
        AzioniModel: function (sValue) {

            var sData = {},
                vValue = "";
            var aColumn = this._oTPC._oPersonalizations.aColumns;
            for (var i = 0; i < aColumn.length; i++) {
                if (aColumn[i].group === "Azione") {
                    vValue = aColumn[i].text.replaceAll(" ", "_");
                    sData[aColumn[i].field] = (sValue[vValue] === undefined) ? "" : sValue[vValue].toString();
                    if (aColumn[i].field === "ATTIVO") {
                        if (sData[aColumn[i].field] === "X") {
                            sData[aColumn[i].field] = true;
                        } else {
                            sData[aColumn[i].field] = false;
                        }
                    }
                } else if (aColumn[i].field === "INDEX") {
                    vValue = aColumn[i].text.replaceAll(" ", "_");
                    sData[aColumn[i].field] = (sValue[vValue] === undefined) ? "" : sValue[vValue].toString();
                }
            }
            sData.PROGRES = (sData.PROGRES === null ? null : Number(sData.PROGRES));
            sData.CARATT_SEDE = (sData.CARATT_SEDE === null ? null : sData.CARATT_SEDE);
            var SedeTecnica = sData.SEDE_TECNICA_P;
            if (SedeTecnica !== undefined) {
                SedeTecnica = SedeTecnica.split("-");
            } else {
                SedeTecnica = [];
            } sData.LIVELLO1 = (SedeTecnica[0] === undefined ? "" : SedeTecnica[0]);
            sData.LIVELLO2 = (SedeTecnica[1] === undefined ? "" : SedeTecnica[1]);
            sData.LIVELLO3 = (SedeTecnica[2] === undefined ? "" : SedeTecnica[2]);
            sData.LIVELLO4 = (SedeTecnica[3] === undefined ? "" : SedeTecnica[3]);
            sData.LIVELLO5 = (SedeTecnica[4] === undefined ? "" : SedeTecnica[4]);
            sData.LIVELLO6 = (SedeTecnica[5] === undefined ? "" : SedeTecnica[5]);
            delete sData.SEDE_TECNICA_P;
            return sData;

        },
        IndexModel: function (sValue) {
            var sData = {},
                vValue = "";
            var aColumn = this._oTPC._oPersonalizations.aColumns;
            for (var i = 0; i < aColumn.length; i++) {
                if (aColumn[i].group === undefined) {
                    vValue = aColumn[i].text.replaceAll(" ", "_");
                    sData[aColumn[i].field] = (sValue[vValue] === undefined) ? "" : sValue[vValue].toString();
                }
            }
            sData.PRIORITA = (sData.PRIORITA === null ? null : Number(sData.PRIORITA));
            sData.FREQ_TEMPO = (sData.FREQ_TEMPO === null ? null : Number(sData.FREQ_TEMPO));
            sData.FREQ_CICLO = (sData.FREQ_CICLO === null ? null : Number(sData.FREQ_CICLO));

            return sData;

        },
        formatFromExcel: function (sValue) {

            var oResource = this.getResourceBundle();
            var vValue = oResource.getText(sValue);
            vValue = vValue.replaceAll(" ", "_");
            return vValue;

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
        onDataExport: async function () {
            var oResource = this.getResourceBundle();
            var items = this.getView().byId("tbPiani").getSelectedItems(),
                aIndex = [],
                aContatore = [],
                aMateriali = [],
                aServizi = [],
                aIndexControl = [];

            if (items.length !== 0) {
                for (var i = 0; i < items.length; i++) {
                    var line = items[i].getBindingContext("allIndex").getObject();
                    if (! aIndexControl.includes(line.INDEX)) {
                        aIndexControl.push(line.INDEX);
                        aIndex.push(this.rowIndex(line));
                    }
                    aContatore.push(this.rowContatore(line));

                    var aFilter = [];
                    aFilter.push(new Filter("INDEX", FilterOperator.EQ, line.INDEX));
                    aFilter.push(new Filter("CONTATORE", FilterOperator.EQ, line.CONTATORE));

                    line.Material = await this._getTable("/AzioniMateriali", aFilter);
                    line.Servizi = await this._getTable("/AzioniServizi", aFilter);

                    aMateriali = aMateriali.concat(this.rowMateriali(line.Material));

                    aServizi = aServizi.concat(this.rowServizi(line.Servizi));
                }

                let wb = XLSX.utils.book_new();
                let ws = XLSX.utils.json_to_sheet(aIndex, {
                    header: this.ColumnIndex(),
                    skipHeader: false
                });
                XLSX.utils.book_append_sheet(wb, ws, oResource.getText("IndiciExcel"));
                ws = XLSX.utils.json_to_sheet(aContatore, {
                    header: this.ColumnContatore(),
                    skipHeader: false
                });
                XLSX.utils.book_append_sheet(wb, ws, oResource.getText("AzioniExcel"));
                ws = XLSX.utils.json_to_sheet(aMateriali, {
                    header: this.ColumnMateriali(),
                    skipHeader: false
                });
                XLSX.utils.book_append_sheet(wb, ws, oResource.getText("MaterialiExcel"));
                ws = XLSX.utils.json_to_sheet(aServizi, {
                    header: this.ColumnServizi(),
                    skipHeader: false
                });
                XLSX.utils.book_append_sheet(wb, ws, oResource.getText("ServiziExcel"));
                XLSX.writeFile(wb, "Prototipi.xlsx");

                // UtilExcel.ExcelDownload(this._createColumnConfig(this.byId("tbPiani")), "Prototipi", aIndex, "Prototipi");
            } else {
                MessageToast.show("Seleziona almeno una riga");
            }
        },
        ColumnMateriali: function () {
            var oResource = this.getResourceBundle();
            var sData = [];
            var vValue = oResource.getText("CONTATORE").replaceAll(" ", "_");
            sData.push(vValue);
            vValue = oResource.getText("MATNR").replaceAll(" ", "_");
            sData.push(vValue);
            vValue = oResource.getText("MENGE").replaceAll(" ", "_");
            sData.push(vValue);
            vValue = oResource.getText("MEINS").replaceAll(" ", "_");
            sData.push(vValue);
            return sData;
        },
        rowMateriali: function (sTable) {
            if (sTable !== undefined) {
                var oResource = this.getResourceBundle();
                var sData = [];
                for (var i = 0; i < sTable.length; i++) {
                    sData.push({
                        [oResource.getText("CONTATORE").replaceAll(" ", "_")]: sTable[i].CONTATORE,
                        [oResource.getText("MATNR").replaceAll(" ", "_")]: sTable[i].MATNR,
                        [oResource.getText("MENGE").replaceAll(" ", "_")]: sTable[i].MENGE,
                        [oResource.getText("MEINS").replaceAll(" ", "_")]: sTable[i].MEINS
                    });
                }

                return sData;
            } else {
                return [];
            }
        },
        ColumnServizi: function () {
            var oResource = this.getResourceBundle();
            var sData = [];
            var vValue = oResource.getText("CONTATORE").replaceAll(" ", "_");
            sData.push(vValue);
            vValue = oResource.getText("ASNUM").replaceAll(" ", "_");
            sData.push(vValue);
            vValue = oResource.getText("MENGE").replaceAll(" ", "_");
            sData.push(vValue);
            vValue = oResource.getText("MEINS").replaceAll(" ", "_");
            sData.push(vValue);
            return sData;
        },
        rowServizi: function (sTable) {
            if (sTable !== undefined) {
                var oResource = this.getResourceBundle();
                var sData = [];
                for (var i = 0; i < sTable.length; i++) {
                    sData.push({
                        [oResource.getText("CONTATORE").replaceAll(" ", "_")]: sTable[i].CONTATORE,
                        [oResource.getText("ASNUM").replaceAll(" ", "_")]: sTable[i].ASNUM,
                        [oResource.getText("MENGE").replaceAll(" ", "_")]: sTable[i].MENGE,
                        [oResource.getText("MEINS").replaceAll(" ", "_")]: sTable[i].MEINS
                    });
                }

                return sData;
            } else {
                return [];
            }
        },
        ColumnContatore: function () {
            var sData = [];
            var aColumn = this._oTPC._oPersonalizations.aColumns;
            sData.push(this.formatFromExcel("INDEX"));
            for (var i = 0; i < aColumn.length; i++) {
                if (aColumn[i].group === "Azione") {
                    var vValue = aColumn[i].text.replaceAll(" ", "_");
                    sData.push(vValue);
                }
            }
            return sData;
        },
        rowContatore: function (sline) {
            var sData = {},
                vValue = "";
            var aColumn = this._oTPC._oPersonalizations.aColumns;
            for (var i = 0; i < aColumn.length; i++) {
                if (aColumn[i].group === "Azione") {
                    vValue = aColumn[i].text.replaceAll(" ", "_");
                    sData[vValue] = sline[aColumn[i].field];
                    if (sData[vValue] === true) {
                        sData[vValue] = "X";
                    }
                    if (sData[vValue] === false) {
                        sData[vValue] = "";
                    }
                } else if (aColumn[i].field === "INDEX") {
                    vValue = aColumn[i].text.replaceAll(" ", "_");
                    sData[vValue] = sline[aColumn[i].field];
                }
            }
            return sData;
        },
        ColumnIndex: function () {
            var sData = [];
            var aColumn = this._oTPC._oPersonalizations.aColumns;
            for (var i = 0; i < aColumn.length; i++) {
                if (aColumn[i].group === undefined) {
                    var vValue = aColumn[i].text.replaceAll(" ", "_");
                    sData.push(vValue);
                }
            }
            return sData;
        },
        rowIndex: function (sline) {
            var sData = {};
            var aColumn = this._oTPC._oPersonalizations.aColumns;
            for (var i = 0; i < aColumn.length; i++) {
                if (aColumn[i].group === undefined) {
                    var vValue = aColumn[i].text.replaceAll(" ", "_");
                    sData[vValue] = sline[aColumn[i].field];
                }
            }
            return sData;
        },
        onModify: function (oEvent) {
            var items = this.getView().byId("tbPiani").getSelectedItems();
            if (items.length === 1) {
                sap.ui.core.BusyIndicator.show();
                this.navTo("DetailPage", {ID: items[0].getBindingContext("allIndex").getObject().ID});
                // this.navTo("DetailPage", {ID: oEvent.getSource().getBindingContext("allIndex").getObject().ID});
            } else {
                MessageToast.show("Seleziona una riga");
            }
        },
        onCopy: function () {
            sap.ui.core.BusyIndicator.show();
            var items = this.getView().byId("tbPiani").getSelectedItems();
            if (items.length === 1) {
                this.navTo("DetailPage", {
                    ID: items[0].getBindingContext("allIndex").getObject().ID,
                    COPY: items[0].getBindingContext("allIndex").getObject().CONTATORE
                });
            } else {
                MessageToast.show("Seleziona una riga");
            }
            /*var items = this.getModel("allIndex").getData();

            for (var i = 0; i < items.length; i++) {
                if (items[i].CHECK_CHECKBOX === true) {
                    this.navTo("DetailPage", {
                        ID: items[i].ID,
                        COPY: "X"
                    });
                }
            }*/
            sap.ui.core.BusyIndicator.hide();
        },
        _createColumnConfig: function () {
            var oResource = this.getResourceBundle();

            var oCols = [
                {
                    column: 'CONTATORE',
                    label: oResource.getText("CONTATORE"),
                    property: 'CONTATORE',
                    type: EdmType.Number
                },
                {
                    column: 'INDEX',
                    label: oResource.getText("INDEX"),
                    property: 'INDEX',
                    width: "10em",
                    type: EdmType.Number
                },
                {
                    column: 'SISTEMA',
                    label: oResource.getText("SISTEMA"),
                    property: 'SISTEMA',
                    type: EdmType.String
                },
                {
                    column: 'CLASSE',
                    label: oResource.getText("CLASSE"),
                    property: 'CLASSE',
                    type: EdmType.String
                }, {
                    column: 'PROGRES',
                    label: oResource.getText("PROGRES"),
                    property: 'PROGRES',
                    type: EdmType.Number
                }, {
                    column: 'DESC_PROG',
                    label: oResource.getText("DESC_PROG"),
                    property: 'DESC_PROG',
                    type: EdmType.String
                }, {
                    column: 'DIVISIONE',
                    label: oResource.getText("DIVISIONE"),
                    property: 'DIVISIONE',
                    type: EdmType.String
                }, {
                    column: 'SEDE_TECNICA',
                    label: oResource.getText("SEDE_TECNICA"),
                    property: 'SEDE_TECNICA',
                    type: EdmType.String
                }, {
                    column: 'SEDE_TECNICA_P',
                    label: oResource.getText("SEDE_TECNICA_P"),
                    property: 'SEDE_TECNICA_P',
                    type: EdmType.String
                }, {
                    column: 'DESC_SEDE',
                    label: oResource.getText("DESC_SEDE"),
                    property: 'DESC_SEDE',
                    type: EdmType.String
                }, {
                    column: 'CLASSE_SEDE',
                    label: oResource.getText("CLASSE_SEDE"),
                    property: 'CLASSE_SEDE',
                    type: EdmType.String
                }, {
                    column: 'CARATT_SEDE',
                    label: oResource.getText("CARATT_SEDE"),
                    property: 'CARATT_SEDE',
                    type: EdmType.String
                }, {
                    column: 'VALORE',
                    label: oResource.getText("VALORE"),
                    property: 'VALORE',
                    type: EdmType.String
                }, {
                    column: 'OGGETTO_TECNICO',
                    label: oResource.getText("OGGETTO_TECNICO"),
                    property: 'OGGETTO_TECNICO',
                    type: EdmType.String
                }, {
                    column: 'PROFILO',
                    label: oResource.getText("PROFILO"),
                    property: 'PROFILO',
                    type: EdmType.String
                }, {
                    column: 'ZBAU',
                    label: oResource.getText("ZBAU"),
                    property: 'ZBAU',
                    type: EdmType.String
                }, {
                    column: 'EQUIPMENT',
                    label: oResource.getText("EQUIPMENT"),
                    property: 'EQUIPMENT',
                    type: EdmType.String
                }, {
                    column: 'DES_COMPONENTE',
                    label: oResource.getText("DES_COMPONENTE"),
                    property: 'DES_COMPONENTE',
                    type: EdmType.String
                }, {
                    column: 'STRATEGIA',
                    label: oResource.getText("STRATEGIA"),
                    property: 'STRATEGIA',
                    type: EdmType.String
                }, {
                    column: 'STRATEGIA_DESC',
                    label: oResource.getText("STRATEGIA_DESC"),
                    property: 'STRATEGIA_DESC',
                    type: EdmType.String
                }, {
                    column: 'TIPO_ORDINE',
                    label: oResource.getText("TIPO_ORDINE"),
                    property: 'TIPO_ORDINE',
                    type: EdmType.String
                }, {
                    column: 'PRIORITA',
                    label: oResource.getText("PRIORITA"),
                    property: 'PRIORITA',
                    type: EdmType.Number
                }, {
                    column: 'TIPO_ATTIVITA',
                    label: oResource.getText("TIPO_ATTIVITA"),
                    property: 'TIPO_ATTIVITA',
                    type: EdmType.String
                }, {
                    column: 'DESC_BREVE',
                    label: oResource.getText("DESC_BREVE"),
                    property: 'DESC_BREVE',
                    type: EdmType.String
                }, {
                    column: 'INDISPONIBILITA',
                    label: oResource.getText("INDISPONIBILITA"),
                    property: 'INDISPONIBILITA',
                    type: EdmType.String
                }, {
                    column: 'TIPO_GESTIONE',
                    label: oResource.getText("TIPO_GESTIONE"),
                    property: 'TIPO_GESTIONE',
                    type: EdmType.String
                }, {
                    column: 'TIPO_GESTIONE_1',
                    label: oResource.getText("TIPO_GESTIONE_1"),
                    property: 'TIPO_GESTIONE_1',
                    type: EdmType.String
                }, {
                    column: 'TIPO_GESTIONE_2',
                    label: oResource.getText("TIPO_GESTIONE_2"),
                    property: 'TIPO_GESTIONE_2',
                    type: EdmType.String
                }, {
                    column: 'DIVISIONEC',
                    label: oResource.getText("DIVISIONEC"),
                    property: 'DIVISIONEC',
                    type: EdmType.String
                }, {
                    column: 'CENTRO_LAVORO',
                    label: oResource.getText("CENTRO_LAVORO"),
                    property: 'CENTRO_LAVORO',
                    type: EdmType.String
                }, {
                    column: 'LSTAR',
                    label: oResource.getText("LSTAR"),
                    property: 'LSTAR',
                    type: EdmType.String
                }, {
                    column: 'STEUS',
                    label: oResource.getText("STEUS"),
                    property: 'STEUS',
                    type: EdmType.String
                }, {
                    column: 'NUM',
                    label: oResource.getText("NUM"),
                    property: 'NUM',
                    type: EdmType.String
                }, {
                    column: 'LSTAR_1',
                    label: oResource.getText("LSTAR_1"),
                    property: 'LSTAR_1',
                    type: EdmType.String
                }, {
                    column: 'STEUS_1',
                    label: oResource.getText("STEUS_1"),
                    property: 'STEUS_1',
                    type: EdmType.String
                }, {
                    column: 'NUM_1',
                    label: oResource.getText("NUM_1"),
                    property: 'NUM_1',
                    type: EdmType.String
                }, {
                    column: 'LSTAR_2',
                    label: oResource.getText("LSTAR_2"),
                    property: 'LSTAR_2',
                    type: EdmType.String
                }, {
                    column: 'STEUS_2',
                    label: oResource.getText("STEUS_2"),
                    property: 'STEUS_2',
                    type: EdmType.String
                }, {
                    column: 'NUM_2',
                    label: oResource.getText("NUM_2"),
                    property: 'NUM_2',
                    type: EdmType.String
                }, {
                    column: 'LSTAR_3',
                    label: oResource.getText("LSTAR_3"),
                    property: 'LSTAR_3',
                    type: EdmType.String
                }, {
                    column: 'STEUS_3',
                    label: oResource.getText("STEUS_3"),
                    property: 'STEUS_3',
                    type: EdmType.String
                }, {
                    column: 'NUM_3',
                    label: oResource.getText("NUM_3"),
                    property: 'NUM_3',
                    type: EdmType.String
                }, {
                    column: 'LSTAR_4',
                    label: oResource.getText("LSTAR_4"),
                    property: 'LSTAR_4',
                    type: EdmType.String
                }, {
                    column: 'STEUS_4',
                    label: oResource.getText("STEUS_4"),
                    property: 'STEUS_4',
                    type: EdmType.String
                }, {
                    column: 'NUM_4',
                    label: oResource.getText("NUM_4"),
                    property: 'NUM_4',
                    type: EdmType.String
                }, {
                    column: 'LSTAR_5',
                    label: oResource.getText("LSTAR_5"),
                    property: 'LSTAR_5',
                    type: EdmType.String
                }, {
                    column: 'STEUS_5',
                    label: oResource.getText("STEUS_5"),
                    property: 'STEUS_5',
                    type: EdmType.String
                }, {
                    column: 'NUM_5',
                    label: oResource.getText("NUM_5"),
                    property: 'NUM_5',
                    type: EdmType.String
                }, {
                    column: 'TESTO_ESTESO_P',
                    label: oResource.getText("TESTO_ESTESO_P"),
                    property: 'TESTO_ESTESO_P',
                    type: EdmType.String
                }, {
                    column: 'TESTO_ESTESO',
                    label: oResource.getText("TESTO_ESTESO"),
                    property: 'TESTO_ESTESO',
                    type: EdmType.String
                }, {
                    column: 'POINT',
                    label: oResource.getText("POINT"),
                    property: 'POINT',
                    type: EdmType.String
                }, {
                    column: 'MPTYP',
                    label: oResource.getText("MPTYP"),
                    property: 'MPTYP',
                    type: EdmType.String
                }, {
                    column: 'RISK',
                    label: oResource.getText("RISK"),
                    property: 'RISK',
                    type: EdmType.String
                }, {
                    column: 'TIPOFREQUENZA',
                    label: oResource.getText("TIPOFREQUENZA"),
                    property: 'TIPOFREQUENZA',
                    type: EdmType.String
                }, {
                    column: 'FREQ_TEMPO',
                    label: oResource.getText("FREQ_TEMPO"),
                    property: 'FREQ_TEMPO',
                    type: EdmType.Number
                }, {
                    column: 'UNITA_TEMPO',
                    label: oResource.getText("UNITA_TEMPO"),
                    property: 'UNITA_TEMPO',
                    type: EdmType.String
                }, {
                    column: 'FREQ_CICLO',
                    label: oResource.getText("FREQ_CICLO"),
                    property: 'FREQ_CICLO',
                    type: EdmType.Number
                }, {
                    column: 'UNITA_CICLO',
                    label: oResource.getText("UNITA_CICLO"),
                    property: 'UNITA_CICLO',
                    type: EdmType.String
                }, {
                    column: 'LIMITE',
                    label: oResource.getText("LIMITE"),
                    property: 'LIMITE',
                    type: EdmType.String
                },
            ];
            return oCols;
        },
        allCheck: function () {
            var chmain = this.getView().byId("chmain").getSelected();
            var data = this.getModel("allIndex").getData();
            if (chmain == true) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].DISPLAY_CHECKBOX === true) 
                        data[i].CHECK_CHECKBOX = true;
                    


                }
            } else if (chmain == false) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].DISPLAY_CHECKBOX === true) 
                        data[i].CHECK_CHECKBOX = false;
                    


                }
            }
            this.getModel("allIndex").refresh();
        },
        HandleMaterialView: async function (oEvent) {
            var line = oEvent.getSource().getBindingContext("allIndex").getObject();

            var aFilter = [];
            aFilter.push(new Filter("INDEX", FilterOperator.EQ, line.INDEX));
            aFilter.push(new Filter("CONTATORE", FilterOperator.EQ, line.CONTATORE));
            var aMaterial = await this._getTable("/AzioniMateriali", aFilter);

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(aMaterial);
            this.setModel(oModel, "aMaterial");

            this.byId("popMaterialiView").open();
        },
        HandleServiziView: async function (oEvent) {
            var line = oEvent.getSource().getBindingContext("allIndex").getObject();

            var aFilter = [];
            aFilter.push(new Filter("INDEX", FilterOperator.EQ, line.INDEX));
            aFilter.push(new Filter("CONTATORE", FilterOperator.EQ, line.CONTATORE));
            var aServizi = await this._getTable("/AzioniServizi", aFilter);

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(aServizi);
            this.setModel(oModel, "aServizi");
            this.byId("popServiziView").open();
        },
        onCloseMatnrView: function () {
            this.byId("popMaterialiView").close();
        },
        onCloseServiziView: function () {
            this.byId("popServiziView").close();
        }

    });
});