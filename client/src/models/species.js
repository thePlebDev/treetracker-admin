/*
 * The model for species function
 */
import * as loglevel from 'loglevel'
import api from '../api/treeTrackerApi'

const log = loglevel.getLogger('../models/species')

const species = {
  state: {
    speciesList: [],
    speciesInput: '',
    speciesDesc: '',
  },
  reducers: {
    setSpeciseList(state, speciesList) {
      const sortedSpeciesList = speciesList.slice().sort((a, b) => a.name.localeCompare(b.name))
      return {
        ...state,
        speciesList: sortedSpeciesList,
      }
    },
    setSpeciesInput(state, text) {
      return {
        ...state,
        speciesInput: text,
      }
    },
    setSpeciesDesc(state, text) {
      return {
        ...state,
        speciesDesc: text,
      }
    },
  },
  effects: {
    async loadSpeciesList() {
      const speciesList = await api.getSpecies()
      log.debug('load species from api:', speciesList.length)
      this.setSpeciseList(speciesList)
    },
    onChange(text) {
      console.log('on change:"', text, '"')
      this.setSpeciesInput(text)
    },
    isNewSpecies(payload, state) {
      //if there are some input, and it don't exist, then new species
      if (!state.species.speciesInput) {
        log.debug('empty species, false')
        return false
      }
      log.debug(
        'to find species %s in list:%d',
        state.species.speciesInput,
        state.species.speciesList.length
      )
      return state.species.speciesList.every((c) => c.name !== state.species.speciesInput)
    },
    async createSpecies(payload, state) {
      const species = await api.createSpecies(state.species.speciesInput)
      console.debug('created new species:', species)
      //update the list
      this.setSpeciseList([species, ...state.species.speciesList])
      return species
    },
    /*
     * to get the species id according the input
     */
    getSpeciesId(payload, state) {
      if (state.species.speciesInput) {
        return state.species.speciesList.reduce((a, c) => {
          if (a) {
            return a
          } else if (c.name === state.species.speciesInput) {
            return c.id
          } else {
            return a
          }
        }, undefined)
      }
    },
    /*
     * to edit the specie
     */
    async editSpecies(payload, state) {
      const { id, name, desc } = payload
      let editedSpecies = await api.editSpecies(id, name, desc)
      console.debug('edit old species:', editedSpecies)
    },
  },
}

export default species
