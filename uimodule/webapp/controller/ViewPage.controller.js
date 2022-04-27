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
            MessageBox.confirm("Confermi l operazione di cambio stato? ", {
                styleClass: "sapUiSizeCompact",
                actions: [
                    "Si", sap.m.MessageBox.Action.NO
                ],
                emphasizedAction: "Si",
                initialFocus: sap.m.MessageBox.Action.NO,
                onClose: function (oAction) {
                    if (oAction === "NO") { // that.cancel();
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
                } else if (!sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO1", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
                if (aSede[1] !== undefined && aSede[1] !== "") {
                    oFilter = new Filter("LIVELLO2", FilterOperator.EQ, aSede[1]);
                    aFilters.push(oFilter);
                } else if (!sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO2", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
                if (aSede[2] !== undefined && aSede[2] !== "") {
                    oFilter = new Filter("LIVELLO3", FilterOperator.EQ, aSede[2]);
                    aFilters.push(oFilter);
                } else if (!sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO3", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
                if (aSede[3] !== undefined && aSede[3] !== "") {
                    oFilter = new Filter("LIVELLO4", FilterOperator.EQ, aSede[3]);
                    aFilters.push(oFilter);
                } else if (!sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO4", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
                if (aSede[4] !== undefined && aSede[4] !== "") {
                    oFilter = new Filter("LIVELLO5", FilterOperator.EQ, aSede[4]);
                    aFilters.push(oFilter);
                } else if (!sFilter.INCLUDI) {
                    oFilter = new Filter("LIVELLO5", FilterOperator.EQ, "");
                    aFilters.push(oFilter);
                }
                if (aSede[5] !== undefined && aSede[5] !== "") {
                    oFilter = new Filter("LIVELLO6", FilterOperator.EQ, aSede[5]);
                    aFilters.push(oFilter);
                } else if (!sFilter.INCLUDI) {
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
            var that = this;
            var oMainModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oMainModel, "uploadModel");
            var excelData = {};
            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {type: 'binary'});
                    workbook.SheetNames.forEach(function (sheetName) { // Here is your object for every sheet in workbook
                        excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        if (excelData.length > 0) {
                            that.getView().getModel("uploadModel").setData(excelData);
                            that.getView().getModel("uploadModel").refresh(true);
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
                var i = 0,
                    aIndex = [],
                    sURL,
                    results,
                    msg = "";
                var rows = this.getView().getModel("uploadModel").getData();
                var sIndex = [];
                // controllo Dati Indice
                for (i = 0; i < rows.length; i++) {

                    sIndex = this.IndexModel(rows[i]);
                    if (! aIndex.includes(sIndex.INDEX)) {
                        aIndex.push(sIndex.INDEX);
                        msg = await this.ControlIndex(sIndex);
                        // Strategia
                        var checkStrategia = await this.checkStrategia(sIndex);
                        if (checkStrategia === "") {
                            msg = "Campo Strategia inserito erroneamente";
                        }

                        if (msg !== "") {
                            msg = msg + ", riga Excel n° " + (
                                i + 2
                            );
                            break;
                        }
                    }
                }
                // controllo Dati Azioni Elementari
                if (msg === "") {
                    for (i = 0; i < rows.length; i++) {

                        sIndex = this.IndexModel(rows[i]);
                        var sAzioni = this.AzioniModel(rows[i]);
                        msg = await this.ControlAzione(sAzioni, sIndex);
                        if (msg !== "") {
                            msg = msg + ", riga n° Excel " + (
                                i + 2
                            );
                            break;
                        } else if (rows[i][oResource.getText("DESC_SEDE")] === undefined) {
                            rows[i][oResource.getText("DESC_SEDE")] = this.DESC_SEDE;
                        }
                    }
                }

                if (msg !== "") {
                    sap.ui.core.BusyIndicator.hide(0);
                    MessageBox.error(msg);
                } else {
                    aIndex = [];
                    for (i = 0; i < rows.length; i++) {

                        var sIndex = this.IndexModel(rows[i]);
                        var sAzioni = this.AzioniModel(rows[i]);

                        if (sAzioni.SEDE_TECNICA === "") {
                            sAzioni.LIVELLO1 = "";
                            sAzioni.LIVELLO2 = "";
                            sAzioni.LIVELLO3 = "";
                            sAzioni.LIVELLO4 = "";
                            sAzioni.LIVELLO5 = "";
                            sAzioni.LIVELLO6 = "";
                            sAzioni.DESC_SEDE = "";
                        }

                        // ID Strategia
                        var selStrategia = await this.checkStrategia(sIndex);
                        sIndex.ID_STRATEGIA = selStrategia.ID_STRATEGIA;
                        sIndex.STRATEGIA_DESC = selStrategia.STRATEGIA_DESC;

                        // Testata Nuova
                        if (sIndex.INDEX.startsWith("C-")) {

                            if (! aIndex.includes(sIndex.INDEX)) {
                                aIndex.push(sIndex.INDEX);
                                // delete sIndex.ID;
                                sIndex.INDEX = await this._getLastItemData("/Index", "", "INDEX");
                                sIndex.INDEX ++;

                                results = await this._saveHana("/Index", sIndex);
                                sIndex.ID = results.ID;
                            }

                        } else { // Testata Modifica
                            if (! aIndex.includes(sIndex.INDEX)) {
                                aIndex.push(sIndex.INDEX);

                                var aFilter = [];
                                aFilter.push(new Filter("INDEX", FilterOperator.EQ, sIndex.INDEX));
                                sIndex.ID = await this._getLastItemData("/Index", aFilter, "ID");

                                sIndex.INDEX = Number(sIndex.INDEX);

                                sURL = "/Index/" + sIndex.ID;
                                results = await this._updateHana(sURL, sIndex);
                            }
                        } sAzioni.ID = results.ID;
                        sAzioni.INDEX = results.INDEX;

                        // Posizione Nuova
                        if (sAzioni.CONTATORE.startsWith("C-")) {

                            sAzioni.CONTATORE = await this._getLastItemData("/Azioni", "", "CONTATORE");
                            sAzioni.CONTATORE ++;

                            results = await this._saveHana("/Azioni", sAzioni);

                        } else { // Posizione Modifica

                            sAzioni.CONTATORE = Number(sAzioni.CONTATORE);

                            sURL = "/Azioni/" + sAzioni.ID + "/" + sAzioni.CONTATORE;
                            results = await this._updateHana(sURL, sAzioni);
                        }

                    }

                    MessageBox.success("Excel Caricato con successo");
                    sap.ui.core.BusyIndicator.hide(0);
                    this.onSearch();
                    this.byId("UploadPiani").close();
                }
            }
        },
        AzioniModel: function (sValue) {
            var oResource = this.getResourceBundle();

            var SedeTecnica = (sValue[oResource.getText("SEDE_TECNICA_P")] === undefined) ? "" : sValue[oResource.getText("SEDE_TECNICA_P")].toString();
            SedeTecnica
            if (SedeTecnica !== undefined) {
                SedeTecnica = SedeTecnica.split("-");
            } else {
                SedeTecnica = [];
            }
            var rValue = {
                CONTATORE: (sValue[oResource.getText("CONTATORE")] === undefined) ? "" : sValue[oResource.getText("CONTATORE")].toString(),
                ATTIVO: (sValue[oResource.getText("ATTIVO")] === undefined) ? undefined : sValue[oResource.getText("ATTIVO")].toString(),
                SISTEMA: (sValue[oResource.getText("SISTEMA")] === undefined) ? "" : sValue[oResource.getText("SISTEMA")].toString(),
                PROGRES: (sValue[oResource.getText("PROGRES")] === undefined) ? "" : sValue[oResource.getText("PROGRES")].toString(),
                DESC_PROG: (sValue[oResource.getText("DESC_PROG")] === undefined) ? "" : sValue[oResource.getText("DESC_PROG")].toString(),
                CLASSE: (sValue[oResource.getText("CLASSE")] === undefined) ? "" : sValue[oResource.getText("CLASSE")].toString(),
                DES_COMPONENTE: (sValue[oResource.getText("DES_COMPONENTE")] === undefined) ? "" : sValue[oResource.getText("DES_COMPONENTE")].toString(),
                DIVISIONE: (sValue[oResource.getText("DIVISIONE")] === undefined) ? "" : sValue[oResource.getText("DIVISIONE")].toString(),
                SEDE_TECNICA: (sValue[oResource.getText("SEDE_TECNICA")] === undefined) ? "" : sValue[oResource.getText("SEDE_TECNICA")].toString(),
                LIVELLO1: (SedeTecnica[0] === undefined ? "" : SedeTecnica[0]),
                LIVELLO2: (SedeTecnica[1] === undefined ? "" : SedeTecnica[1]),
                LIVELLO3: (SedeTecnica[2] === undefined ? "" : SedeTecnica[2]),
                LIVELLO4: (SedeTecnica[3] === undefined ? "" : SedeTecnica[3]),
                LIVELLO5: (SedeTecnica[4] === undefined ? "" : SedeTecnica[4]),
                LIVELLO6: (SedeTecnica[5] === undefined ? "" : SedeTecnica[5]),
                DESC_SEDE: (sValue[oResource.getText("DESC_SEDE")] === undefined) ? "" : sValue[oResource.getText("DESC_SEDE")].toString(),
                EQUIPMENT: (sValue[oResource.getText("EQUIPMENT")] === undefined) ? "" : sValue[oResource.getText("EQUIPMENT")].toString(),
                TESTO_ESTESO_P: (sValue[oResource.getText("TESTO_ESTESO_P")] === undefined) ? "" : sValue[oResource.getText("TESTO_ESTESO_P")].toString(),
                CLASSE_SEDE: (sValue[oResource.getText("CLASSE_SEDE")] === undefined) ? "" : sValue[oResource.getText("CLASSE_SEDE")].toString(),
                CARATT_SEDE: (sValue[oResource.getText("CARATT_SEDE")] === undefined) ? "" : sValue[oResource.getText("CARATT_SEDE")].toString(),
                OGGETTO_TECNICO: (sValue[oResource.getText("OGGETTO_TECNICO")] === undefined) ? "" : sValue[oResource.getText("OGGETTO_TECNICO")].toString(),
                PROFILO: (sValue[oResource.getText("PROFILO")] === undefined) ? "" : sValue[oResource.getText("PROFILO")].toString(),
                ZBAU: (sValue[oResource.getText("ZBAU")] === undefined) ? "" : sValue[oResource.getText("ZBAU")].toString(),
                VALORE: (sValue[oResource.getText("VALORE")] === undefined) ? "" : sValue[oResource.getText("VALORE")].toString()
            };
            return rValue;
        },
        IndexModel: function (sValue) {
            var oResource = this.getResourceBundle();
            var rValue = {
                INDEX: (sValue[oResource.getText("INDEX")] === undefined) ? undefined : sValue[oResource.getText("INDEX")].toString(),
                ID_STRATEGIA: (sValue[oResource.getText("ID_STRATEGIA")] === undefined) ? undefined : sValue[oResource.getText("ID_STRATEGIA")].toString(),
                STRATEGIA: (sValue[oResource.getText("STRATEGIA")] === undefined) ? undefined : sValue[oResource.getText("STRATEGIA")].toString(),
                STRATEGIA_DESC: (sValue[oResource.getText("STRATEGIA_DESC")] === undefined) ? undefined : sValue[oResource.getText("STRATEGIA_DESC")].toString(),
                DIVISIONEC: (sValue[oResource.getText("DIVISIONEC")] === undefined) ? undefined : sValue[oResource.getText("DIVISIONEC")].toString(),
                CENTRO_LAVORO: (sValue[oResource.getText("CENTRO_LAVORO")] === undefined) ? undefined : sValue[oResource.getText("CENTRO_LAVORO")].toString(),
                TIPO_GESTIONE: (sValue[oResource.getText("TIPO_GESTIONE")] === undefined) ? undefined : sValue[oResource.getText("TIPO_GESTIONE")].toString(),
                TIPO_GESTIONE_1: (sValue[oResource.getText("TIPO_GESTIONE_1")] === undefined) ? undefined : sValue[oResource.getText("TIPO_GESTIONE_1")].toString(),
                TIPO_GESTIONE_2: (sValue[oResource.getText("TIPO_GESTIONE_2")] === undefined) ? undefined : sValue[oResource.getText("TIPO_GESTIONE_2")].toString(),
                PRIORITA: (sValue[oResource.getText("PRIORITA")] === undefined) ? undefined : sValue[oResource.getText("PRIORITA")].toString(),
                TIPO_ATTIVITA: (sValue[oResource.getText("TIPO_ATTIVITA")] === undefined) ? undefined : sValue[oResource.getText("TIPO_ATTIVITA")].toString(),
                DESC_BREVE: (sValue[oResource.getText("DESC_BREVE")] === undefined) ? undefined : sValue[oResource.getText("DESC_BREVE")].toString(),
                TESTO_ESTESO: (sValue[oResource.getText("TESTO_ESTESO")] === undefined) ? undefined : sValue[oResource.getText("TESTO_ESTESO")].toString(),
                INDISPONIBILITA: (sValue[oResource.getText("INDISPONIBILITA")] === undefined) ? undefined : sValue[oResource.getText("INDISPONIBILITA")].toString(),
                TIPO_ORDINE: (sValue[oResource.getText("TIPO_ORDINE")] === undefined) ? undefined : sValue[oResource.getText("TIPO_ORDINE")].toString(),
                LSTAR: (sValue[oResource.getText("LSTAR")] === undefined) ? undefined : sValue[oResource.getText("LSTAR")].toString(),
                STEUS: (sValue[oResource.getText("STEUS")] === undefined) ? undefined : sValue[oResource.getText("STEUS")].toString(),
                NUM: (sValue[oResource.getText("NUM")] === undefined) ? undefined : sValue[oResource.getText("NUM")].toString(),
                LSTAR_1: (sValue[oResource.getText("LSTAR_1")] === undefined) ? undefined : sValue[oResource.getText("LSTAR_1")].toString(),
                STEUS_1: (sValue[oResource.getText("STEUS_1")] === undefined) ? undefined : sValue[oResource.getText("STEUS_1")].toString(),
                NUM_1: (sValue[oResource.getText("NUM_1")] === undefined) ? undefined : sValue[oResource.getText("NUM_1")].toString(),
                LSTAR_2: (sValue[oResource.getText("LSTAR_2")] === undefined) ? undefined : sValue[oResource.getText("LSTAR_2")].toString(),
                STEUS_2: (sValue[oResource.getText("STEUS_2")] === undefined) ? undefined : sValue[oResource.getText("STEUS_2")].toString(),
                NUM_2: (sValue[oResource.getText("NUM_2")] === undefined) ? undefined : sValue[oResource.getText("NUM_2")].toString(),
                LSTAR_3: (sValue[oResource.getText("LSTAR_3")] === undefined) ? undefined : sValue[oResource.getText("LSTAR_3")].toString(),
                STEUS_3: (sValue[oResource.getText("STEUS_3")] === undefined) ? undefined : sValue[oResource.getText("STEUS_3")].toString(),
                NUM_3: (sValue[oResource.getText("NUM_3")] === undefined) ? undefined : sValue[oResource.getText("NUM_3")].toString(),
                LSTAR_4: (sValue[oResource.getText("LSTAR_4")] === undefined) ? undefined : sValue[oResource.getText("LSTAR_4")].toString(),
                STEUS_4: (sValue[oResource.getText("STEUS_4")] === undefined) ? undefined : sValue[oResource.getText("STEUS_4")].toString(),
                NUM_4: (sValue[oResource.getText("NUM_4")] === undefined) ? undefined : sValue[oResource.getText("NUM_4")].toString(),
                LSTAR_5: (sValue[oResource.getText("LSTAR_5")] === undefined) ? undefined : sValue[oResource.getText("LSTAR_5")].toString(),
                STEUS_5: (sValue[oResource.getText("STEUS_5")] === undefined) ? undefined : sValue[oResource.getText("STEUS_5")].toString(),
                NUM_5: (sValue[oResource.getText("NUM_5")] === undefined) ? undefined : sValue[oResource.getText("NUM_5")].toString(),
                RISK: (sValue[oResource.getText("RISK")] === undefined) ? undefined : sValue[oResource.getText("RISK")].toString(),
                TIPOFREQUENZA: (sValue[oResource.getText("TIPOFREQUENZA")] === undefined) ? undefined : sValue[oResource.getText("TIPOFREQUENZA")].toString(),
                FREQ_TEMPO: (sValue[oResource.getText("FREQ_TEMPO")] === undefined) ? undefined : sValue[oResource.getText("FREQ_TEMPO")].toString(),
                UNITA_TEMPO: (sValue[oResource.getText("UNITA_TEMPO")] === undefined) ? undefined : sValue[oResource.getText("UNITA_TEMPO")].toString(),
                FREQ_CICLO: (sValue[oResource.getText("FREQ_CICLO")] === undefined) ? undefined : sValue[oResource.getText("FREQ_CICLO")].toString(),
                UNITA_CICLO: (sValue[oResource.getText("UNITA_CICLO")] === undefined) ? undefined : sValue[oResource.getText("UNITA_CICLO")].toString(),
                LIMITE: (sValue[oResource.getText("LIMITE")] === undefined) ? undefined : sValue[oResource.getText("LIMITE")].toString(),
                POINT: (sValue[oResource.getText("POINT")] === undefined) ? undefined : sValue[oResource.getText("POINT")].toString(),
                MPTYP: (sValue[oResource.getText("MPTYP")] === undefined) ? undefined : sValue[oResource.getText("MPTYP")].toString()
            };
            return rValue;
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
        onDataExport: function () {
            var items = this.getView().byId("tbPiani").getSelectedItems(),
                pianiTableSel = [];
            if (items.length !== 0) {
                for (var i = 0; i < items.length; i++) {
                    var line = items[i].getBindingContext("allIndex").getObject();
                    pianiTableSel.push(line);
                }
                // this.getModel("allIndex").getData()
                UtilExcel.ExcelDownload(this._createColumnConfig(this.byId("tbPiani")), "Prototipi", pianiTableSel, "Prototipi");
            } else {
                MessageToast.show("Seleziona almeno una riga");
            }
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
        }

    });
});
