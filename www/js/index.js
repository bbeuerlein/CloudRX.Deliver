var defaultPackage = {
	"Recipient": "",
	"Department": "",
	"Building": ""
};

function appViewModel() {
	var self = this;

	self.selectedPackage = ko.observable();
	self.selectedPackages = ko.observableArray();
	self.errorMsg = ko.observable("");
	self.statusMsg = ko.observable("");
	self.signature = ko.observable("");
	self.manualEntry = ko.observable("");

	self.onDeviceReady = function() {
		self.receivedEvent('deviceready');
	};
	self.receivedEvent = function(id) {
		var parentElement = document.getElementById(id);
		var listeningElement = parentElement.querySelector('.listening');
		var receivedElement = parentElement.querySelector('.received');

		listeningElement.setAttribute('style', 'display:none;');
		receivedElement.setAttribute('style', 'display:block;');

		console.log('Received Event: ' + id);
	};	
	document.addEventListener('deviceready', self.onDeviceReady, false);
	
	
	// DELIVERIES---------------------------------
	self.scanBarcode_deliver = function () {
		console.log('scanning');
		try {
			//var scanner = cordova.require("cordova/plugin/BarcodeScanner");

			cordova.plugins.barcodeScanner.scan( function (result) { 
				self.errorMsg("");
				self.getDelivery(result.text);

			}, function (error) { 
				console.log("Scanning failed: ", error); 
				self.errorMsg("Scanning failed: " + error);
			} );
		} catch (ex) {
			self.statusMsg("");
			console.log(ex.message);
			self.errorMsg(ex.message);
		}
	};
	
	self.uploadDelivery = function () {
		var d = {
			"Receivables": ko.toJS(self.selectedPackages()),
			"Signature": self.signature()
		};
		$('#dialogue_ConfirmDelivery').modal('hide');
		self.statusMsg("Uploading " + d.Receivables.length + " package(s)");

		$.ajax({
			type: "POST",
			contentType: "application/json",
			dataType: "text json",
			url: 'https://wr.arecloudship.com/RX/actionapi/MobileApp/Deliver',
			data: ko.toJSON(d),
			success: function (data) {
				self.errorMsg("");
				//alert("Upload Successful!");
				//self.selectedPackage(null);
				self.reset();
				self.statusMsg("Upload Successful!");
			},
			error: function (jqHXR, textStatus, errorThrown) {
				self.statusMsg("");
				alert("Error transmitting packages... please try again.");
				try {
					var response = jQuery.parseJSON(jqHXR.responseText);
					self.errorMsg(response.ExceptionMessage);
				}
				catch (e) {
					self.errorMsg(jqHXR.responseText);
				}
				//self.errorMsg("Error transmitting packages... please try again.");
			}
		});
	};
	
	self.reset = function () {
		self.selectedPackage(null);
		self.selectedPackages.removeAll();
		self.signature("");
		self.errorMsg("");
		self.statusMsg("");
		self.manualEntry("");
	};
	
	//self.getPackages = function () {
	//    var d = ko.mapping.toJSON(self.scannedPackages());
	//
	//    $.ajax({
	//        type: "POST",
	//        contentType: "application/json",
	//        dataType: "text json",
	//        url: 'https://wr.arecloudship.com/RX/api/MobileApp/GetDeliveries',
	//        data: ko.mapping.toJSON(d),
	//        success: function (data) {
	//			self.errorMsg("");
	//            //alert("Upload Successful!");
	//			self.deliveryPackages(data);
	//        },
	//        error: function (jqHXR, textStatus, errorThrown) {
	//            alert("Error getting package... please try again.");
	//        }
	//    });
	//};
	
	self.getDelivery = function(id) {
		self.statusMsg("Getting delivery with barcode: " + id);
		//alert('https://wr.arecloudship.com/RX/actionapi/MobileApp/GetPackage/' + id);
		 $.ajax({
			type: "GET",
			contentType: "application/json",
			dataType: "text json",
			url: 'https://wr.arecloudship.com/RX/actionapi/MobileApp/GetPackage/' + id,
			success: function (data) {
				self.errorMsg("");
				//alert("Upload Successful!");
				self.selectedPackage(data);
				self.selectedPackages.push(data);
				self.statusMsg("Package with tracking number: " + id + " retreived. Total packages: " + self.selectedPackages().length);
			},
			error: function (jqHXR, textStatus, errorThrown) {
				self.statusMsg("");
				try {
					var response = jQuery.parseJSON(jqHXR.responseText);
					self.errorMsg(response.ExceptionMessage);
				}
				catch (e) {
					self.errorMsg(jqHXR.responseText);
				}
				//self.errorMsg(jqHXR.responseText);
				alert("Error getting delivery... please try again.");
			}
		});
	};
	
	self.requestSignature = function () {
		$('#dialogue_ConfirmDelivery').modal('show');
	};
	self.hideSignature = function () {
		$('#dialogue_ConfirmDelivery').modal('hide');
	};
	
	self.promptManual = function () {
		$('#dialogue_ManualEntry').modal('show');
	};
	self.hideManual = function () {
		$('#dialogue_ManualEntry').modal('hide');
	};
	self.processManual = function () {
		$('#dialogue_ManualEntry').modal('hide');
		self.getDelivery(self.manualEntry());
	};
	
	//self.refresh = function() {
	//	self.getPackages();
	//};
	
};

$(document).ready(function() {
	ko.applyBindings(new appViewModel());
});