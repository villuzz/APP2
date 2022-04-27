sap.ui.define([

	"./ExcelDownload"

], function () {

	"use strict";

	// class providing static utility methods.

	return {

		ExcelDownload: function (columns, sheetName, dataSource, fileName) {

			var oSettings = {

				workbook: {

					columns: columns,
					context: {
						sheetName: sheetName
					}

				},

				dataSource: dataSource,

				fileName: fileName

			};

			var oSheet = new sap.ui.export.Spreadsheet(oSettings);

			oSheet.build().finally(function () {

				oSheet.destroy();

			});

		}

	};

});