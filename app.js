// Simple Expense Tracker - stores entries in localStorage
const STORAGE_KEY = 'money-expense-tracker.entries'

function uid(){return Date.now().toString(36) + Math.random().toString(36).slice(2,8)}

function loadEntries(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  }catch(e){console.error('Failed to parse entries', e); return []}
}

function saveEntries(entries){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function formatCurrency(n){
  return Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})
}

function render(){
  const tbody = document.querySelector('#entries-table tbody')
  tbody.innerHTML = ''
  const entries = loadEntries()
  const filterMonth = document.getElementById('filter-month').value
  const filtered = entries.filter(e=>{
    if(!filterMonth) return true
    const ym = e.date.slice(0,7)
    return ym === filterMonth
  }).sort((a,b)=> b.date.localeCompare(a.date))

  let totalIncome = 0, totalExpense = 0
  for(const e of filtered){
    const tr = document.createElement('tr')
    tr.classList.add(e.type === 'income' ? 'income' : 'expense')
    const sign = e.type === 'income' ? '+' : '-'
    const amt = `${sign}${formatCurrency(Math.abs(Number(e.amount)))}`
    tr.innerHTML = `<td>${e.date}</td><td>${e.type}</td><td>${e.category||''}</td><td class="muted">${e.description||''}</td><td class="amount">${amt}</td><td><button class="btn-delete" data-id="${e.id}">Delete</button></td>`
    tbody.appendChild(tr)
    if(e.type==='income') totalIncome += Number(e.amount)
    else totalExpense += Number(e.amount)
  }

  // empty state
  const emptyEl = document.getElementById('empty-state')
  if(filtered.length === 0) {
    emptyEl.style.display = 'block'
    document.getElementById('entries-table').style.display = 'none'
  } else {
    emptyEl.style.display = 'none'
    document.getElementById('entries-table').style.display = 'table'
  }

  document.getElementById('total-income').textContent = formatCurrency(totalIncome)
  document.getElementById('total-expense').textContent = formatCurrency(totalExpense)
  document.getElementById('balance').textContent = formatCurrency(totalIncome - totalExpense)

  // attach delete handlers
  tbody.querySelectorAll('.btn-delete').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-id')
      const all = loadEntries().filter(x=>x.id!==id)
      saveEntries(all)
      render()
    })
  })
}

function addEntry(e){
  e.preventDefault()
  const type = document.getElementById('type').value
  const amount = parseFloat(document.getElementById('amount').value)
  const date = document.getElementById('date').value
  const category = document.getElementById('category').value.trim()
  const description = document.getElementById('description').value.trim()
  if(!date || isNaN(amount)) return alert('Please provide date and amount')

  const entries = loadEntries()
  entries.push({id:uid(),type,amount,category,description,date})
  saveEntries(entries)
  document.getElementById('entry-form').reset()
  // focus back to amount for quick entry
  document.getElementById('amount').focus()
  render()
}

function exportJSON(){
  const entries = loadEntries()
  const blob = new Blob([JSON.stringify(entries, null, 2)],{type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'expense-tracker-data.json'
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
}

function importJSON(file){
  const reader = new FileReader()
  reader.onload = ()=>{
    try{
      const imported = JSON.parse(reader.result)
      if(!Array.isArray(imported)) throw new Error('Invalid format')
      // basic validation and merge
      const existing = loadEntries()
      const merged = existing.concat(imported.map(i=>({id:i.id||uid(),type:i.type||'expense',amount:Number(i.amount)||0,category:i.category||'',description:i.description||'',date:i.date||new Date().toISOString().slice(0,10)})))
      saveEntries(merged)
      render()
      alert('Import complete')
    }catch(err){alert('Failed to import: '+err.message)}
  }
  reader.readAsText(file)
}

function clearAll(){
  if(!confirm('Clear all entries? This cannot be undone.')) return
  localStorage.removeItem(STORAGE_KEY)
  render()
}

// wire up
document.getElementById('entry-form').addEventListener('submit', addEntry)
document.getElementById('export-btn').addEventListener('click', exportJSON)
document.getElementById('import-file').addEventListener('change', e=>{
  const f = e.target.files[0]
  if(f) importJSON(f)
  e.target.value = ''
})
document.getElementById('clear-btn').addEventListener('click', clearAll)
document.getElementById('filter-month').addEventListener('change', render)

// initial render
// set default date to today for convenience
const dateInput = document.getElementById('date')
if(dateInput && !dateInput.value){
  const today = new Date().toISOString().slice(0,10)
  dateInput.value = today
}
document.getElementById('amount').setAttribute('inputmode','decimal')
render()
