/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
 	const EBCCValidationDetailModel = require( '../models/EBCCValidationDetailModel.js' );

	// Libraries
	const config = require( '../../config/config.js' );
	const date = require( '../libraries/date' );

	// Modules
	const validator = require( 'ferds-validator');

/**
 * Create
 * Untuk membuat data baru
 * --------------------------------------------------------------------------
 */
 	exports.create = ( req, res ) => {
 		var rules = [
 			{
				"name": "EBCC_VALIDATION_CODE",
				"value": req.body.EBCC_VALIDATION_CODE,
				"rules": "required|alpha_numeric"
			},
			{
				"name": "ID_KUALITAS",
				"value": req.body.ID_KUALITAS,
				"rules": "required|numeric"
			},
			{
				"name": "JUMLAH",
				"value": req.body.JUMLAH.toString(),
				"rules": "required|numeric"
			},
			{
				"name": "INSERT_USER",
				"value": req.body.INSERT_USER,
				"rules": "required|alpha_numeric"
			},
			{
				"name": "INSERT_TIME",
				"value": req.body.INSERT_TIME.toString(),
				"rules": "required|exact_length(14)|numeric"
			}
		];
		var run_validator = validator.run( rules );
		console.log( run_validator.error_lists );

		if ( run_validator.status == true ) {
	 		var auth = req.auth;
	 		var postdata = new EBCCValidationDetailModel( {
	 			EBCC_VALIDATION_CODE: req.body.EBCC_VALIDATION_CODE,
				ID_KUALITAS: req.body.ID_KUALITAS,
				JUMLAH: req.body.JUMLAH,
				INSERT_USER: req.body.INSERT_USER || "",
				INSERT_TIME: req.body.INSERT_TIME || 0,
				UPDATE_USER: req.body.UPDATE_USER || "",
				UPDATE_TIME: req.body.UPDATE_TIME || 0,
				DELETE_USER: "",
				DELETE_TIME: 0
	 		} );

	 		

	 		postdata.save()
			.then( data => {
				if ( !data ) {
					return res.send( {
						status: false,
						message: config.error_message.create_404,
						data: {}
					} );
				}
				res.send( {
					status: true,
					message: config.error_message.create_200,
					data: {}
				} );
			} ).catch( err => {
				res.send( {
					status: false,
					message: config.error_message.create_500,
					data: {}
				} );
			} );
		}
		else {
			res.send( {
				status: false,
				message: "Data gagal diinput, periksa kembali inputan.",
				data: {}
			} );
		}
 	}