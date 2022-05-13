sap.ui.define(['jquery.sap.global'],   function (jQuery) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP2.i18n.i18n"}).getResourceBundle();

    var PisteTableHome = {
        oData: {
            _persoSchemaVersion: "1.0", 
            aColumns: [
              {id: "Azioni-tAzioni-dCol3", order: 1, text: oResource.getText("ATTIVO"), visible: true},
              {id: "Azioni-tAzioni-dCol2", order: 2, text: oResource.getText("CONTATORE"), visible: true},
              {id: "Azioni-tAzioni-dCol5", order: 3, text: oResource.getText("SISTEMA"), visible: true},
              {id: "Azioni-tAzioni-dCol8", order: 4, text: oResource.getText("CLASSE"), visible: true},
              {id: "Azioni-tAzioni-dCol6", order: 5, text: oResource.getText("PROGRES"), visible: true},
              {id: "Azioni-tAzioni-dCol7", order: 6, text: oResource.getText("DESC_PROG"), visible: true},
              {id: "Azioni-tAzioni-dCol10", order: 7, text: oResource.getText("DIVISIONE"), visible: true},
              {id: "Azioni-tAzioni-dCol20", order: 8, text: oResource.getText("SEDE_TECNICA"), visible: true},
              {id: "Azioni-tAzioni-dCol20", order: 9, text: oResource.getText("SEDE_TECNICA_P"), visible: true},
              {id: "Azioni-tAzioni-dCol36", order: 10, text: oResource.getText("DESC_SEDE"), visible: true},
              {id: "Azioni-tAzioni-dCol38", order: 11, text: oResource.getText("MATNR"), visible: true},
              {id: "Azioni-tAzioni-dCol39", order: 12, text: oResource.getText("ASNUM"), visible: true},
              {id: "Azioni-tAzioni-dCol29", order: 13, text: oResource.getText("TESTO_ESTESO_P"), visible: true},
              {id: "Azioni-tAzioni-dCol28", order: 14, text: oResource.getText("EQUIPMENT"), visible: false},
              {id: "Azioni-tAzioni-dCol9", order: 15, text: oResource.getText("DES_COMPONENTE"), visible: false},
              {id: "Azioni-tAzioni-dCol30", order: 16, text: oResource.getText("CLASSE_SEDE"), visible: false},
              {id: "Azioni-tAzioni-dCol31", order: 17, text: oResource.getText("CARATT_SEDE"), visible: false},
              {id: "Azioni-tAzioni-dCol32", order: 18, text: oResource.getText("OGGETTO_TECNICO"), visible: false},
              {id: "Azioni-tAzioni-dCol33", order: 19, text: oResource.getText("PROFILO"), visible: false},
              {id: "Azioni-tAzioni-dCol34", order: 20, text: oResource.getText("ZBAU"), visible: false},
              {id: "Azioni-tAzioni-dCol35", order: 21, text: oResource.getText("VALORE"), visible: false}
            ]
        },

        getPersData: function () {
            var oDeferred = new jQuery.Deferred();
            if (!this._oBundle) {
                this._oBundle = this.oData;
            }
            var oBundle = this._oBundle;
            oDeferred.resolve(oBundle);
            return oDeferred.promise();
        }, 

        setPersData: function (oBundle) {
            var oDeferred = new jQuery.Deferred();
            this._oBundle = oBundle;
            oDeferred.resolve();
            return oDeferred.promise();
        }
    };

    return PisteTableHome;

});
