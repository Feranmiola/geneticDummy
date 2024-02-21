// Import data from a JSON file
let data = require('./data.json');

let courses = data.courses;
let rooms = data.rooms;
let constraints = data.constraints;

class Schedule {
    constructor(courses, rooms, constraints) {
        this.courses = courses;
        this.rooms = rooms;
        this.constraints = constraints;
        this.fitness = 0;
        this.schedule = [];
    }

    // Generate a random schedule
    generate() {
        for (let course of this.courses) {
            let valid = false;
            while (!valid) {
                let room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
                let time = this.constraints.start + Math.floor(Math.random() * (this.constraints.end - this.constraints.start));
                let class_ = {course, room, time};

                // Check if the room is already occupied at this time
                if (this.schedule.some(c => c.room === room && c.time === time)) {
                    continue;
                }

                // Check if the level and program already have a class at this time
                if (this.schedule.some(c => c.course.level === course.level && c.course.program === course.program && c.time === time)) {
                    continue;
                }

                this.schedule.push(class_);
                valid = true;
            }
        }
    }

    // Calculate the fitness of the schedule
    calculateFitness() {
        this.fitness = 0;
        for (let class_ of this.schedule) {
            if (class_.time >= this.constraints.start && class_.time <= this.constraints.end) {
                this.fitness++;
            }
        }
    }
}

class GeneticAlgorithm {
    constructor(populationSize, mutationRate, crossoverRate) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.crossoverRate = crossoverRate;
        this.population = [];
    }

    // Initialize the population
    initializePopulation() {
        while (this.population.length < this.populationSize) {
            let schedule = new Schedule(courses, rooms, constraints);
            schedule.generate();
            this.population.push(schedule);
        }
    }

    // Perform crossover
    crossover(parent1, parent2) {
        let crossoverPoint = Math.floor(Math.random() * parent1.schedule.length);
        let childSchedule = parent1.schedule.slice(0, crossoverPoint).concat(parent2.schedule.slice(crossoverPoint));
        let child = new Schedule(courses, rooms, constraints);
        child.schedule = childSchedule;
        child.calculateFitness();
        return child;
    }

    // Perform mutation
    mutate(schedule) {
        let classToMutate = schedule.schedule[Math.floor(Math.random() * schedule.schedule.length)];
        classToMutate.time = constraints.start + Math.floor(Math.random() * (constraints.end - constraints.start));
        schedule.calculateFitness();
    }

    // Select the best individuals
    selection() {
        this.population.sort((a, b) => b.fitness - a.fitness);
        this.population = this.population.slice(0, this.population.length / 2);
    }

    // Run the genetic algorithm
    run() {
        this.initializePopulation();
        for (let i = 0; i < 100; i++) {
            this.selection();
            for (let j = 0; j < this.population.length; j++) {
                if (Math.random() < this.crossoverRate) {
                    let parent1 = this.population[Math.floor(Math.random() * this.population.length)];
                    let parent2 = this.population[Math.floor(Math.random() * this.population.length)];
                    let child = this.crossover(parent1, parent2);
                    if (Math.random() < this.mutationRate) {
                        this.mutate(child);
                    }
                    this.population.push(child);
                }
            }
        }
        this.population.sort((a, b) => b.fitness - a.fitness);
        return this.population[0];
    }
}
