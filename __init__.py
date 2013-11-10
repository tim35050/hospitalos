from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route('/')
def index():
	context = []
	# Assume 3 vitals for now
	vital = {}
	vital['vital_name'] = 'Blood pressure'
	vital['vital_icon_name'] = 'bloodpressure-icon.png'
	vital['vital_value'] = '130/90 mmHg'
	vital['vital_risk'] = 'high-risk'
	vital['vital_chart'] = 'bloodpressure-chart.png'
	vital['vital_hist'] = 'bloodpressure-histogram.png'
 	context.append(vital)

	vital = {}
	vital['vital_name'] = 'Blood glucose level'
	vital['vital_icon_name'] = 'bloodglucose-icon.png'
	vital['vital_value'] = '100 mg/dL'
	vital['vital_risk'] = 'medium-risk'
	vital['vital_chart'] = 'glucose-chart.png'
	vital['vital_hist'] = 'glucose-histogram.png'
	context.append(vital)

	vital = {}
	vital['vital_name'] = 'BMI'
	vital['vital_icon_name'] = 'bmi-icon.png'
	vital['vital_value'] = '20 kg/m&#178;'
	vital['vital_risk'] = 'low-risk'
	vital['vital_chart'] = 'bmi-chart.png'
	vital['vital_hist'] = 'bmi-histogram.png'
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