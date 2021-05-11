/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
 	const EBCCValidationHeaderModel = require( _directory_base + '/app/v2.0/Http/Models/EBCCValidationHeaderModel.js' );

	// Modules
	const Validator = require( 'ferds-validator');
	// const Kafka = require( 'kafka-node' );

	// Libraries
	const KafkaServer = require( _directory_base + '/app/v2.0/Http/Libraries/KafkaServer.js' );
	const getDate = require( _directory_base + '/app/v2.2/Http/Libraries/getDate.js')

/*
 |--------------------------------------------------------------------------
 | Versi 2.2
 |--------------------------------------------------------------------------
 */
 	/** 
 	  * Create
	  * @desc Untuk membuat data baru.
	  * @return json
	  * --------------------------------------------------------------------
	*/
	 	exports.create = async ( req, res ) => {
			EBCCValidationHeaderModel.updateOne(
				{ 
					EBCC_VALIDATION_CODE: req.body.EBCC_VALIDATION_CODE,
				}, {
					$setOnInsert: {
						EBCC_VALIDATION_CODE: req.body.EBCC_VALIDATION_CODE,
						WERKS: req.body.WERKS,
						AFD_CODE: req.body.AFD_CODE,
						BLOCK_CODE: req.body.BLOCK_CODE,
						NO_TPH: req.body.NO_TPH,
						STATUS_TPH_SCAN: req.body.STATUS_TPH_SCAN,
						ALASAN_MANUAL: req.body.ALASAN_MANUAL || "",
						LAT_TPH: req.body.LAT_TPH,
						LON_TPH: req.body.LON_TPH,
						DELIVERY_CODE: req.body.DELIVERY_CODE,
						STATUS_DELIVERY_CODE: req.body.STATUS_DELIVERY_CODE,
						INSERT_USER: req.body.INSERT_USER,
						INSERT_TIME: req.body.INSERT_TIME,
						STATUS_SYNC: req.body.STATUS_SYNC || "",
						// SYNC_TIME: req.body.SYNC_TIME || 0,
						SYNC_TIME: getDate.getDate(new Date()) || 0,
						UPDATE_USER: req.body.UPDATE_USER || "",
						UPDATE_TIME: req.body.UPDATE_TIME || 0
					}
				}, {
					upsert: true //insert data jika ebcc_validation_code belum ada, jika sudah ada lakukan update
				}
			).then(result => {
				if(result.upserted) {
					var kafka_body = {
						EBVTC: req.body.EBCC_VALIDATION_CODE,
						WERKS: req.body.WERKS,
						AFD_CODE: req.body.AFD_CODE,
						BLOCK_CODE: req.body.BLOCK_CODE,
						NO_TPH: req.body.NO_TPH,
						STPHS: req.body.STATUS_TPH_SCAN,
						ALSNM: req.body.ALASAN_MANUAL || "",
						LAT_TPH: req.body.LAT_TPH,
						LON_TPH: req.body.LON_TPH,
						DLVCD: req.body.DELIVERY_CODE,
						SDLVC: req.body.STATUS_DELIVERY_CODE,
						INSUR: req.body.INSERT_USER,
						INSTM: req.body.INSERT_TIME,
						SSYNC: req.body.STATUS_SYNC || "",
						STIME: req.body.SYNC_TIME || 0,
						UPTUR: req.body.UPDATE_USER || "",
						UPTTM: req.body.UPDATE_TIME || 0,
						INSERT_BY_NAME: req.auth.USERNAME
					}
					if (config.app.env != 'dev') {
						KafkaServer.producer( 'INS_MSA_EBCCVAL_TR_EBCC_VALIDATION_H', JSON.stringify( kafka_body ) );
					}
					res.send({
						status: true,
						message: 'save success!',
						data: []
					});
				} else {
					res.send({
						status: true,
						message: 'skip save!',
						data: []
					});
				}
				
			}).catch(err => {
				console.log(err);
				res.send({
					status: false,
					message: 'Internal server error',
					data: []
				});
			})
	 	}