sap.ui.define(['jquery.sap.global'],   function (jQuery) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP2.i18n.i18n"}).getResourceBundle();

    var PisteTableHome = {
        oData: {
            _persoSchemaVersion: "1.0", 
            aColumns: [

              {id: "Piani-tbPiani-col2", order: 2, text: oResource.getText("CONTATORE"), field: "CONTATORE", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col3", order: 1, text: oResource.getText("ATTIVO"), field: "ATTIVO", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col5", order: 3, text: oResource.getText("SISTEMA"), field: "SISTEMA", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col8", order: 4, text: oResource.getText("CLASSE"), field: "CLASSE", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col6", order: 5, text: oResource.getText("PROGRES"), field: "PROGRES", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col7", order: 6, text: oResource.getText("DESC_PROG"), field: "DESC_PROG", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col10", order: 7, text: oResource.getText("DIVISIONE"), field: "DIVISIONE", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col20", order: 8, text: oResource.getText("SEDE_TECNICA"), field: "SEDE_TECNICA", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col21", order: 9, text: oResource.getText("SEDE_TECNICA_P"), field: "SEDE_TECNICA_P", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col27", order: 10, text: oResource.getText("DESC_SEDE"), field: "DESC_SEDE", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col30", order: 18, text: oResource.getText("CLASSE_SEDE"), field: "CLASSE_SEDE", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col31", order: 19, text: oResource.getText("CARATT_SEDE"), field: "CARATT_SEDE", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col104", order: 20, text: oResource.getText("MATNR"), field: "MATNR", group:"Other", visible: true},
              {id: "Piani-tbPiani-col105", order: 21, text: oResource.getText("ASNUM"), field: "ASNUM", group:"Other", visible: true},
              {id: "Piani-tbPiani-col35", order: 22, text: oResource.getText("VALORE"), field: "VALORE", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col32", order: 23, text: oResource.getText("OGGETTO_TECNICO"), field: "OGGETTO_TECNICO", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col33", order: 24, text: oResource.getText("PROFILO"), field: "PROFILO", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col34", order: 25, text: oResource.getText("ZBAU"), field: "ZBAU", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col28", order: 26, text: oResource.getText("EQUIPMENT"), field: "EQUIPMENT", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col9", order: 27, text: oResource.getText("DES_COMPONENTE"), field: "DES_COMPONENTE", group:"Azione", visible: true},
              {id: "Piani-tbPiani-col1", order: 40, text: oResource.getText("INDEX"), field: "INDEX", visible: true},
              {id: "Piani-tbPiani-col37", order: 41, text: oResource.getText("STRATEGIA"), field: "STRATEGIA", visible: true},
              {id: "Piani-tbPiani-col38", order: 42, text: oResource.getText("STRATEGIA_DESC"), field: "STRATEGIA_DESC", visible: true},
              {id: "Piani-tbPiani-col58", order: 43, text: oResource.getText("TIPO_ORDINE"), field: "TIPO_ORDINE", visible: true},
              {id: "Piani-tbPiani-col53", order: 44, text: oResource.getText("PRIORITA"), field: "PRIORITA", visible: true},
              {id: "Piani-tbPiani-col54", order: 45, text: oResource.getText("TIPO_ATTIVITA"), field: "TIPO_ATTIVITA", visible: true},
              {id: "Piani-tbPiani-col55", order: 46, text: oResource.getText("DESC_BREVE"), field: "DESC_BREVE", visible: true},
              {id: "Piani-tbPiani-col57", order: 47, text: oResource.getText("INDISPONIBILITA"), field: "INDISPONIBILITA", visible: true},
              {id: "Piani-tbPiani-col50", order: 48, text: oResource.getText("TIPO_GESTIONE"), field: "TIPO_GESTIONE", visible: true},
              {id: "Piani-tbPiani-col51", order: 49, text: oResource.getText("TIPO_GESTIONE_1"), field: "TIPO_GESTIONE_1", visible: true},
              {id: "Piani-tbPiani-col52", order: 50, text: oResource.getText("TIPO_GESTIONE_2"), field: "TIPO_GESTIONE_2", visible: true},
              {id: "Piani-tbPiani-col40", order: 51, text: oResource.getText("CENTRO_LAVORO"), field: "CENTRO_LAVORO", visible: true},
              {id: "Piani-tbPiani-col39", order: 52, text: oResource.getText("DIVISIONEC"), field: "DIVISIONEC", visible: true},
              {id: "Piani-tbPiani-col29", order: 60, text: oResource.getText("TESTO_ESTESO_P"), field: "TESTO_ESTESO_P", group:"Azione", visible: false},
              {id: "Piani-tbPiani-col56", order: 61, text: oResource.getText("TESTO_ESTESO"), field: "TESTO_ESTESO", visible: false},
              {id: "Piani-tbPiani-col59", order: 62, text: oResource.getText("LSTAR"), field: "LSTAR", visible: false},
              {id: "Piani-tbPiani-col60", order: 63, text: oResource.getText("STEUS"), field: "STEUS", visible: false},
              {id: "Piani-tbPiani-col70", order: 64, text: oResource.getText("NUM"), field: "NUM", visible: false},
              {id: "Piani-tbPiani-col71", order: 65, text: oResource.getText("LSTAR_1"), field: "LSTAR_1", visible: false},
              {id: "Piani-tbPiani-col72", order: 65, text: oResource.getText("STEUS_1"), field: "STEUS_1", visible: false},
              {id: "Piani-tbPiani-col73", order: 73, text: oResource.getText("NUM_1"), field: "NUM_1", visible: false},
              {id: "Piani-tbPiani-col74", order: 74, text: oResource.getText("LSTAR_2"), field: "LSTAR_2", visible: false},
              {id: "Piani-tbPiani-col75", order: 75, text: oResource.getText("STEUS_2"), field: "STEUS_2", visible: false},
              {id: "Piani-tbPiani-col76", order: 76, text: oResource.getText("NUM_2"), field: "NUM_2", visible: false},
              {id: "Piani-tbPiani-col77", order: 77, text: oResource.getText("LSTAR_3"), field: "LSTAR_3", visible: false},
              {id: "Piani-tbPiani-col78", order: 78, text: oResource.getText("STEUS_3"), field: "STEUS_3", visible: false},
              {id: "Piani-tbPiani-col79", order: 79, text: oResource.getText("NUM_3"), field: "NUM_3", visible: false},
              {id: "Piani-tbPiani-col80", order: 80, text: oResource.getText("LSTAR_4"), field: "LSTAR_4", visible: false},
              {id: "Piani-tbPiani-col90", order: 90, text: oResource.getText("STEUS_4"), field: "STEUS_4", visible: false},
              {id: "Piani-tbPiani-col91", order: 91, text: oResource.getText("NUM_4"), field: "NUM_4", visible: false},
              {id: "Piani-tbPiani-col92", order: 92, text: oResource.getText("LSTAR_5"), field: "LSTAR_5", visible: false},
              {id: "Piani-tbPiani-col93", order: 93, text: oResource.getText("STEUS_5"), field: "STEUS_5", visible: false},
              {id: "Piani-tbPiani-col94", order: 94, text: oResource.getText("NUM_5"), field: "NUM_5", visible: false},
              {id: "Piani-tbPiani-col95", order: 95, text: oResource.getText("RISK"), field: "RISK", visible: false},
              {id: "Piani-tbPiani-col96", order: 96, text: oResource.getText("LIMITE"), field: "LIMITE", visible: false},
              {id: "Piani-tbPiani-col103", order: 97, text: oResource.getText("TIPOFREQUENZA"), field: "TIPOFREQUENZA", visible: false},
              {id: "Piani-tbPiani-col97", order: 98, text: oResource.getText("FREQ_TEMPO"), field: "FREQ_TEMPO", visible: false},
              {id: "Piani-tbPiani-col98", order: 99, text: oResource.getText("UNITA_TEMPO"), field: "UNITA_TEMPO", visible: false},
              {id: "Piani-tbPiani-col99", order: 100, text: oResource.getText("FREQ_CICLO"), field: "FREQ_CICLO", visible: false},
              {id: "Piani-tbPiani-col100", order: 101, text: oResource.getText("UNITA_CICLO"), field: "UNITA_CICLO", visible: false},
              {id: "Piani-tbPiani-col101", order: 102, text: oResource.getText("POINT"), field: "POINT", visible: false},
              {id: "Piani-tbPiani-col102", order: 103, text: oResource.getText("MPTYP"), field: "MPTYP", visible: false},

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
