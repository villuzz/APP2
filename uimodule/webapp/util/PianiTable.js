sap.ui.define(['jquery.sap.global'],  function (jQuery) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP2.i18n.i18n"}).getResourceBundle();

    var PisteTableHome = {
        oData: {
            _persoSchemaVersion: "1.0",
            aColumns: [
              {id: "Piani-tbPiani-col	1	", order: 0, text: oResource.getText("	INDEX	"), visible: true},
              {id: "Piani-tbPiani-col	2	", order: 1, text: oResource.getText("	STARTEGIA	"), visible: true},
              {id: "Piani-tbPiani-col	3	", order: 2, text: oResource.getText("	STRATEGIA_DESC	"), visible: true},
              {id: "Piani-tbPiani-col	4	", order: 3, text: oResource.getText("	SEDE_TECNICA	"), visible: true},
              {id: "Piani-tbPiani-col	5	", order: 4, text: oResource.getText("	DIVISIONE	"), visible: true},
              {id: "Piani-tbPiani-col	6	", order: 5, text: oResource.getText("	LIVELLO1	"), visible: true},
              {id: "Piani-tbPiani-col	7	", order: 6, text: oResource.getText("	LIVELLO2	"), visible: true},
              {id: "Piani-tbPiani-col	8	", order: 7, text: oResource.getText("	LIVELLO3	"), visible: true},
              {id: "Piani-tbPiani-col	9	", order: 8, text: oResource.getText("	LIVELLO4	"), visible: true},
              {id: "Piani-tbPiani-col	10	", order: 9, text: oResource.getText("	LIVELLO5	"), visible: true},
              {id: "Piani-tbPiani-col	11	", order: 10, text: oResource.getText("	LIVELLO6	"), visible: true},
              {id: "Piani-tbPiani-col	12	", order: 11, text: oResource.getText("	DESC_SEDE	"), visible: true},
              {id: "Piani-tbPiani-col	13	", order: 12, text: oResource.getText("	CLASSE_SEDE	"), visible: true},
              {id: "Piani-tbPiani-col	14	", order: 13, text: oResource.getText("	CARATT_SEDE	"), visible: true},
              {id: "Piani-tbPiani-col	15	", order: 14, text: oResource.getText("	OGGETTO_TECNICO	"), visible: true},
              {id: "Piani-tbPiani-col	16	", order: 15, text: oResource.getText("	PROFILO	"), visible: true},
              {id: "Piani-tbPiani-col	17	", order: 16, text: oResource.getText("	ZBAU	"), visible: true},
              {id: "Piani-tbPiani-col	18	", order: 17, text: oResource.getText("	DIVISIONEC	"), visible: true},
              {id: "Piani-tbPiani-col	19	", order: 18, text: oResource.getText("	CENTRO_LAVORO	"), visible: true},
              {id: "Piani-tbPiani-col	20	", order: 19, text: oResource.getText("	LSTAR	"), visible: true},
              {id: "Piani-tbPiani-col	21	", order: 20, text: oResource.getText("	STEUS	"), visible: true},
              {id: "Piani-tbPiani-col	22	", order: 21, text: oResource.getText("	NUM	"), visible: true},
              {id: "Piani-tbPiani-col	23	", order: 22, text: oResource.getText("	PERSONE	"), visible: true},
              {id: "Piani-tbPiani-col	24	", order: 23, text: oResource.getText("	HPER	"), visible: true},
              {id: "Piani-tbPiani-col	25	", order: 24, text: oResource.getText("	LSTAR_1	"), visible: true},
              {id: "Piani-tbPiani-col	26	", order: 25, text: oResource.getText("	STEUS_1	"), visible: true},
              {id: "Piani-tbPiani-col	27	", order: 26, text: oResource.getText("	NUM_1	"), visible: true},
              {id: "Piani-tbPiani-col	28	", order: 27, text: oResource.getText("	PERSONE_1	"), visible: true},
              {id: "Piani-tbPiani-col	29	", order: 28, text: oResource.getText("	HPER_1	"), visible: true},
              {id: "Piani-tbPiani-col	30	", order: 29, text: oResource.getText("	LSTAR_2	"), visible: true},
              {id: "Piani-tbPiani-col	31	", order: 30, text: oResource.getText("	STEUS_2	"), visible: true},
              {id: "Piani-tbPiani-col	32	", order: 31, text: oResource.getText("	NUM_2	"), visible: true},
              {id: "Piani-tbPiani-col	33	", order: 32, text: oResource.getText("	PERSONE_2	"), visible: true},
              {id: "Piani-tbPiani-col	34	", order: 33, text: oResource.getText("	HPER_2	"), visible: true},
              {id: "Piani-tbPiani-col	35	", order: 34, text: oResource.getText("	LSTAR_3	"), visible: true},
              {id: "Piani-tbPiani-col	36	", order: 35, text: oResource.getText("	STEUS_3	"), visible: true},
              {id: "Piani-tbPiani-col	37	", order: 36, text: oResource.getText("	NUM_3	"), visible: true},
              {id: "Piani-tbPiani-col	38	", order: 37, text: oResource.getText("	PERSONE_3	"), visible: true},
              {id: "Piani-tbPiani-col	39	", order: 38, text: oResource.getText("	HPER_3	"), visible: true},
              {id: "Piani-tbPiani-col	40	", order: 39, text: oResource.getText("	LSTAR_4	"), visible: true},
              {id: "Piani-tbPiani-col	41	", order: 40, text: oResource.getText("	STEUS_4	"), visible: true},
              {id: "Piani-tbPiani-col	42	", order: 41, text: oResource.getText("	NUM_4	"), visible: true},
              {id: "Piani-tbPiani-col	43	", order: 42, text: oResource.getText("	PERSONE_4	"), visible: true},
              {id: "Piani-tbPiani-col	44	", order: 43, text: oResource.getText("	HPER_4	"), visible: true},
              {id: "Piani-tbPiani-col	45	", order: 44, text: oResource.getText("	LSTAR_5	"), visible: true},
              {id: "Piani-tbPiani-col	46	", order: 45, text: oResource.getText("	STEUS_5	"), visible: true},
              {id: "Piani-tbPiani-col	47	", order: 46, text: oResource.getText("	NUM_5	"), visible: true},
              {id: "Piani-tbPiani-col	48	", order: 47, text: oResource.getText("	PERSONE_5	"), visible: true},
              {id: "Piani-tbPiani-col	49	", order: 48, text: oResource.getText("	HPER_5	"), visible: true},
              {id: "Piani-tbPiani-col	50	", order: 49, text: oResource.getText("	PRIORITA	"), visible: true},
              {id: "Piani-tbPiani-col	51	", order: 50, text: oResource.getText("	DESTINATARIO	"), visible: true},
              {id: "Piani-tbPiani-col	52	", order: 51, text: oResource.getText("	TESTO_ESTESO	"), visible: true},
              {id: "Piani-tbPiani-col	53	", order: 52, text: oResource.getText("	SISTEMA_PMO	"), visible: true},
              {id: "Piani-tbPiani-col	54	", order: 53, text: oResource.getText("	PROGRES_PMO	"), visible: true},
              {id: "Piani-tbPiani-col	55	", order: 54, text: oResource.getText("	CLASSE_PMO	"), visible: true},
              {id: "Piani-tbPiani-col	56	", order: 55, text: oResource.getText("	TIPO_GESTIONE	"), visible: true},
              {id: "Piani-tbPiani-col	57	", order: 56, text: oResource.getText("	TIPO_GESTIONE_1	"), visible: true},
              {id: "Piani-tbPiani-col	58	", order: 57, text: oResource.getText("	TIPO_GESTIONE_2	"), visible: true},
              {id: "Piani-tbPiani-col	59	", order: 58, text: oResource.getText("	RISK	"), visible: true},
              {id: "Piani-tbPiani-col	60	", order: 59, text: oResource.getText("	POINT	"), visible: true},
              {id: "Piani-tbPiani-col	61	", order: 60, text: oResource.getText("	MPTYP	"), visible: true},
              {id: "Piani-tbPiani-col	62	", order: 61, text: oResource.getText("	LIMITE	"), visible: true},
              {id: "Piani-tbPiani-col	63	", order: 62, text: oResource.getText("	FREQ_TEMPO	"), visible: true},
              {id: "Piani-tbPiani-col	64	", order: 63, text: oResource.getText("	UNITA_TEMPO	"), visible: true},
              {id: "Piani-tbPiani-col	65	", order: 64, text: oResource.getText("	FREQ_CICLO	"), visible: true},
              {id: "Piani-tbPiani-col	66	", order: 65, text: oResource.getText("	UNITA_CICLO	"), visible: true},
              {id: "Piani-tbPiani-col	67	", order: 66, text: oResource.getText("	FREQ_RISK	"), visible: true},
              {id: "Piani-tbPiani-col	68	", order: 67, text: oResource.getText("	UNITA_RISK	"), visible: true},
              {id: "Piani-tbPiani-col	69	", order: 68, text: oResource.getText("	LIMITE2	"), visible: true},
              {id: "Piani-tbPiani-col	70	", order: 69, text: oResource.getText("	CONTATORE	"), visible: true},
              {id: "Piani-tbPiani-col	71	", order: 70, text: oResource.getText("	DATA_MODIFICA	"), visible: true},
              {id: "Piani-tbPiani-col	72	", order: 71, text: oResource.getText("	SISTEMA	"), visible: true},
              {id: "Piani-tbPiani-col	73	", order: 72, text: oResource.getText("	PROGRES	"), visible: true},
              {id: "Piani-tbPiani-col	74	", order: 73, text: oResource.getText("	CLASSE	"), visible: true},
              {id: "Piani-tbPiani-col	75	", order: 74, text: oResource.getText("	DES_COMPONENTE	"), visible: true}

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
