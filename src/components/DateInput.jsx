import React from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ptBR } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar } from 'lucide-react'

// Register Portuguese locale
registerLocale('pt-BR', ptBR)

const DateInput = ({ value, onChange, placeholder, required, name }) => {
  // Convert string value to Date object
  const dateValue = value ? new Date(value) : null

  const handleChange = (date) => {
    // Convert Date object to YYYY-MM-DD string format
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const formattedDate = `${year}-${month}-${day}`
      
      // Simulate event for form compatibility
      onChange({
        target: {
          name,
          value: formattedDate,
          type: 'date'
        }
      })
    } else {
      onChange({
        target: {
          name,
          value: '',
          type: 'date'
        }
      })
    }
  }

  return (
    <div className="relative">
      <DatePicker
        selected={dateValue}
        onChange={handleChange}
        dateFormat="dd/MM/yyyy"
        locale="pt-BR"
        placeholderText={placeholder}
        required={required}
        className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        calendarClassName="custom-calendar"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

export default DateInput
