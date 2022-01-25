sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "PM030/APP2/util/PianiTable",
	"sap/m/TablePersoController"
], function (Controller, JSONModel, MessageBox, PianiTable, TablePersoController) {
  "use strict";

  return Controller.extend("PM030.APP2.controller.ViewPage", {
    onInit: function () {

      this.getOwnerComponent().getRouter().getRoute("ViewPage").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: function () {
        this._mViewSettingsDialogs = {};
        this._oTPC = new TablePersoController({
          table: this.byId("tbPiani"),
          componentName: "Piani",
          persoService: PianiTable
        }).activate();
    },

    onPersoButtonPressed: function () {
        this._oTPC.openDialog();
    },

    handleUploadPiani: function () {
			this._oValueHelpDialog = sap.ui.xmlfragment("PM030.APP2.fragment.UploadPiani", this);
			this.getView().addDependent(this._oValueHelpDialog);
			this.getView().setModel(this.oEmployeeModel);
			this._oValueHelpDialog.open();

		},
		onCloseFileUpload: function () {
			this.onSearch();
			this._oValueHelpDialog.destroy();

		},

    onSearch: function () {

      var oBinding = this.byId("tbPiani").getBinding("items");

      //var aFilters = [];
			//var oFilter = {};

      //if(){
			//  oFilter = new sap.ui.model.Filter({ path: 'WBS_Element', operator: 'EQ', value1: '' });
			//  aFilters.push(oFilter);
      //}

      //oBinding.filter(aFilters);

			if (oBinding.isSuspended()) {
				oBinding.resume();
			}
    }

  });
});