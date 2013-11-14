from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route('/')
def index():
	context = []
	# Assume 4 vitals for now

	vital = {}
	vital['vital_id'] = 'bmi'
	vital['vital_name'] = 'BMI'
	vital['vital_icon_name'] = 'bmi-icon.png'
	vital['vital_values'] = [28] #[21.26]
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



	return render_template('index.html', context = context)

@app.route('/profile')
def profile():
	return render_template('profile.html')

@app.route('/vitals')
def vitals():

	return render_template('vitals.html')

@app.route('/diagnosis')
def diagnosis():
	return render_template('diagnosis.html')

if __name__ == '__main__':
    app.run()