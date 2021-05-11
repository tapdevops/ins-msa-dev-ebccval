/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
// Models
const EBCCValidationDetailModel = require(_directory_base + '/app/v2.0/Http/Models/EBCCValidationDetailModel.js');
const Kualitas = require(_directory_base + '/app/v2.0/Http/Models/KualitasModel.js');

// Modules
const validator = require('ferds-validator');

// Libraries
const KafkaServer = require(_directory_base + '/app/v2.0/Http/Libraries/KafkaServer.js');
const getDate = require(_directory_base + '/app/v2.2/Http/Libraries/getDate.js');

/*
 |--------------------------------------------------------------------------
 | Versi 2.1
 |--------------------------------------------------------------------------
 */
/** 
  * Create
* @desc Untuk membuat data baru.
* @return json
* --------------------------------------------------------------------
*/

// function to generate yyyymmddhhss date format
// const pad = (v) => {
// 	return (v < 10) ? '0' + v : v
// }

// const getDate= (d) => {
// 	let year = d.getFullYear()
// 	let month = pad(d.getMonth() + 1)
// 	let day = pad(d.getDate())
// 	let hour = pad(d.getHours())
// 	let min = pad(d.getMinutes())
// 	let sec = pad(d.getSeconds())
// 	//YYYYMMDDhhmmss
// 	return Number(year + month + day + hour + min + sec)
// }


exports.create = async (req, res) => {
	EBCCValidationDetailModel.updateOne(
		{
			EBCC_VALIDATION_CODE: req.body.EBCC_VALIDATION_CODE,
			ID_KUALITAS: req.body.ID_KUALITAS
		}, {
		$setOnInsert: {
			EBCC_VALIDATION_CODE: req.body.EBCC_VALIDATION_CODE,
			ID_KUALITAS: req.body.ID_KUALITAS,
			JUMLAH: req.body.JUMLAH,
			INSERT_USER: req.body.INSERT_USER || "",
			INSERT_TIME: req.body.INSERT_TIME || 0,
			STATUS_SYNC: req.body.STATUS_SYNC || "",
			// SYNC_TIME: req.body.SYNC_TIME || 0,
			SYNC_TIME: getDate.getDate(new Date()) || 0,
			UPDATE_USER: req.body.UPDATE_USER || "",
			UPDATE_TIME: req.body.UPDATE_TIME || 0
		}
	}, {
		upsert: true //insert data jika ebcc_validation_code belum ada, jika sudah ada lakukan update
	}
	).then(async (result) => {
		if (result.upserted) {
			let kriteriaBuah = await Kualitas.findOne({ ID_KUALITAS: req.body.ID_KUALITAS }).select({ _id: 0, SHORT_NAME: 1 });
			var kafka_body = {
				EBVTC: req.body.EBCC_VALIDATION_CODE,
				IDKLT: req.body.ID_KUALITAS,
				JML: req.body.JUMLAH,
				INSUR: req.body.INSERT_USER || "",
				INSTM: req.body.INSERT_TIME || 0,
				SSYNC: req.body.STATUS_SYNC || "",
				STIME: req.body.SYNC_TIME || 0,
				UPTUR: req.body.UPDATE_USER || "",
				UPTTM: req.body.UPDATE_TIME || 0,
				KRITERIA_BUAH: kriteriaBuah.SHORT_NAME,
				SAMPLING_TYPE: req.auth.USER_ROLE,
				INSERT_BY_NAME: req.auth.USERNAME

			}
			console.log(kafka_body);
			if (config.app.env != 'dev') {
				KafkaServer.producer('INS_MSA_EBCCVAL_TR_EBCC_VALIDATION_D', JSON.stringify(kafka_body));
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
