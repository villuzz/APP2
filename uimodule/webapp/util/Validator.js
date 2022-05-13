sap.ui.define([
	"sap/m/MessageBox"
], function (MessageBox) {
	"use strict";

	return {

		validateView: function () {

			var bError = false;
      var vTxt = "";

			//Get All fields
			var allRegisteredControls = sap.ui.getCore().byFieldGroupId("");

			//Input
			var aInputs = allRegisteredControls.filter(c => c.isA("sap.m.Input"));

			for (var i = 0; i < aInputs.length; i++) {
				if (aInputs[i].getValueState() === sap.ui.core.ValueState.Error) {
					bError = true;
          vTxt = aInputs[i].getValueStateText();
				}
			}

			//ComboBox
			var aComboBox = allRegisteredControls.filter(c => c.isA("sap.m.ComboBox"));

			for (var i = 0; i < aComboBox.length; i++) {
				if (aComboBox[i].getValueState() === sap.ui.core.ValueState.Error) {
					bError = true;
          vTxt = aComboBox[i].getValueStateText();
				}
			}

      //Select
			var aSelect = allRegisteredControls.filter(c => c.isA("sap.m.Select"));

			for (var i = 0; i < aSelect.length; i++) {
				if (aSelect[i].getValueState() === sap.ui.core.ValueState.Error) {
					bError = true;
          vTxt = aSelect[i].getValueStateText();
				}
			}

			//DatePicker
			/*var aDatePicker = allRegisteredControls.filter(c => c.isA("sap.m.DatePicker"));

			for (var i = 0; i < aDatePicker.length; i++) {
				if (aDatePicker[i].getRequired() && aDatePicker[i].getValue() == '' && aInputs[i].getId().includes(sSuffix)) {
					aDatePicker[i].setValueState(sap.ui.core.ValueState.Error);
					bError = true;
				} else {
					aDatePicker[i].setValueState(sap.ui.core.ValueState.None);
				}
			}*/

			if (bError) {
				MessageBox.error(vTxt);
			}

			return !bError;

		},

		clearAll: function () {
			this.clearValidation();
			this.clearFields();
		},

		clearValidation: function () {

			//Get All fields
			var allRegisteredControls = sap.ui.getCore().byFieldGroupId("");

			//Input
			var aInputs = allRegisteredControls.filter(c => c.isA("sap.m.Input"));

			for (var i = 0; i < aInputs.length; i++) {
				aInputs[i].setValueState(sap.ui.core.ValueState.None);
			}

			//ComboBox
			var aComboBox = allRegisteredControls.filter(c => c.isA("sap.m.ComboBox"));

			for (var i = 0; i < aComboBox.length; i++) {
				aComboBox[i].setValueState(sap.ui.core.ValueState.None);
			}

      //Select
			var aSelect = allRegisteredControls.filter(c => c.isA("sap.m.Select"));

			for (var i = 0; i < aSelect.length; i++) {
				aSelect[i].setValueState(sap.ui.core.ValueState.None);
			}

		},

		clearFields: function () {

			//Get All fields
			var allRegisteredControls = sap.ui.getCore().byFieldGroupId("");

			//Input
			var aInputs = allRegisteredControls.filter(c => c.isA("sap.m.Input"));

			for (var i = 0; i < aInputs.length; i++) {
				aInputs[i].setValue("");
			}

			//ComboBox
			var aComboBox = allRegisteredControls.filter(c => c.isA("sap.m.ComboBox"));

			for (var i = 0; i < aComboBox.length; i++) {
				aComboBox[i].setSelectedKey("");
			}

			//DatePicker
			var aDatePicker = allRegisteredControls.filter(c => c.isA("sap.m.DatePicker"));

			for (var i = 0; i < aDatePicker.length; i++) {
				aDatePicker[i].setValue(null);
			}

		},

	};

});