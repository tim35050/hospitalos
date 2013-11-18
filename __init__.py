import os
from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route('/app')
def myapp():
	return render_template('index.html')

@app.route('/')
def index():
	context = []
	# Assume 4 vitals for now

	vital = {}
	vital['vital_id'] = 'bmi'
	vital['vital_name'] = 'BMI'
	vital['vital_icon_name'] = 'bmi-icon.png'
	vital['vital_values'] = [27] #[21.26]
	vital['vital_values_sep'] = ''
	vital['vital_unit'] = 'kg/m&#178;'
	context.append(vital)

	vital = {}
	vital['vital_id'] = 'cholesterol'
	vital['vital_name'] = 'Cholesterol'
	vital['vital_icon_name'] = 'cholesterol-icon.png'
	vital['vital_values'] = [230, 136]
	vital['vital_values_sep'] = '/'
	vital['vital_unit'] = 'mg/dL'
 	context.append(vital)

 # 	vital = {}
	# vital['vital_id'] = 'bloodglucose'
	# vital['vital_name'] = 'Blood glucose level'
	# vital['vital_icon_name'] = 'bloodglucose-icon.png'
	# vital['vital_values'] = [170]
	# vital['vital_values_sep'] = ''
	# vital['vital_unit'] = 'mg/dL'
	# context.append(vital)

	vital = {}
	vital['vital_id'] = 'bloodpressure'
	vital['vital_name'] = 'Blood pressure'
	vital['vital_icon_name'] = 'bloodpressure-icon.png'
	vital['vital_values'] = [110, 70] #[139, 94]
	vital['vital_values_sep'] = '/'
	vital['vital_unit'] = 'mmHg'
 	context.append(vital)

	return render_template('app.html', context = context)

if __name__ == '__main__':
	port = int(os.environ.get("PORT", 5000))
	app.run(host='0.0.0.0', port=port)