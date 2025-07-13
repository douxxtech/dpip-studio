const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

async function loadProjects() {
    try {
        const response = await fetch('/projects');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('projectsContainer').innerHTML =
            `<div class="error">Failed to load projects. Please try again later.</div>`;
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projectsContainer');
    container.innerHTML = '';

    if (projects.length === 0) {
        container.innerHTML = '<div class="loading">No projects found.</div>';
        return;
    }

    projects.forEach(project => {
        const projectCard = document.createElement('a');
        projectCard.href = `${project.url}`;
        projectCard.className = 'project-card';

        projectCard.innerHTML = `
                    <div class="project-info">
                        <h3 class="project-title">${project.title}</h3>
                        <p class="project-description">${project.description}</p>
                        <span class="project-status">${project.status}</span>
                    </div>
                    <div class="project-thumbnail">
                        <img src="${project.image || 'https://via.placeholder.com/140'}" alt="${project.title}">
                    </div>
                `;

        container.appendChild(projectCard);
    });
}

let isScrollingProjects = false;
let projectsScrollAmount = 0;
const projectsScroll = document.querySelector('.projects-scroll');
const projectsContainer = document.querySelector('.projects-container');

function handleProjectsScroll(e) {
    const projectsSection = document.querySelector('.projects-section');
    const rect = projectsSection.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const screenCenter = window.innerHeight / 2;
    const tolerance = 100;
    const isInProjectsSection = Math.abs(sectionCenter - screenCenter) <= tolerance;

    if (isInProjectsSection && !isScrollingProjects) {
        e.preventDefault();
        const maxScroll = projectsScroll.scrollWidth - projectsContainer.offsetWidth;
        const scrollSpeed = 30;

        if (e.deltaY > 0) {
            projectsScrollAmount = Math.min(projectsScrollAmount + scrollSpeed, maxScroll);
        } else {
            projectsScrollAmount = Math.max(projectsScrollAmount - scrollSpeed, 0);
        }

        projectsScroll.style.transform = `translateX(-${projectsScrollAmount}px)`;

        if (projectsScrollAmount >= maxScroll && e.deltaY > 0) {
            isScrollingProjects = true;
            setTimeout(() => { isScrollingProjects = false; }, 100);
        }

        if (projectsScrollAmount <= 0 && e.deltaY < 0) {
            isScrollingProjects = true;
            setTimeout(() => { isScrollingProjects = false; }, 100);
        }
    }
}

window.addEventListener('wheel', handleProjectsScroll, { passive: false });

let touchStartX = 0;
let touchStartY = 0;

projectsContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

projectsContainer.addEventListener('touchmove', (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const diffX = touchStartX - touchCurrentX;
    const diffY = touchStartY - touchCurrentY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
        const maxScroll = projectsScroll.scrollWidth - projectsContainer.offsetWidth;
        projectsScrollAmount = Math.max(0, Math.min(projectsScrollAmount + diffX, maxScroll));
        projectsScroll.style.transform = `translateX(-${projectsScrollAmount}px)`;
    }

    touchStartX = touchCurrentX;
    touchStartY = touchCurrentY;
});

let isDragging = false;
let startX;
let scrollStart;

projectsContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX;
    scrollStart = projectsScrollAmount;
    projectsContainer.classList.add('dragging');
});

projectsContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    projectsContainer.classList.remove('dragging');
});

projectsContainer.addEventListener('mouseup', () => {
    isDragging = false;
    projectsContainer.classList.remove('dragging');
});

projectsContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const diff = e.pageX - startX;
    const maxScroll = projectsScroll.scrollWidth - projectsContainer.offsetWidth;
    projectsScrollAmount = Math.max(0, Math.min(scrollStart - diff, maxScroll));
    projectsScroll.style.transform = `translateX(-${projectsScrollAmount}px)`;
});

const header = document.querySelector('header');
const heroSection = document.querySelector('.hero');
const missionSection = document.querySelector('.mission-section');

function handleHeaderOnScroll() {
    if (window.innerWidth <= 768) {
        header.style.transform = 'translateY(0)';
        return;
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const heroHeight = heroSection.offsetHeight;
    const missionOffset = missionSection.getBoundingClientRect().top;

    const inHero = scrollTop < heroHeight;
    const nearMission = missionOffset < 300;

    if (scrollTop <= 50 || !inHero || nearMission) {
        header.style.transform = 'translateY(0)';
    } else {
        header.style.transform = 'translateY(-100%)';
    }
}

window.addEventListener('scroll', handleHeaderOnScroll);
window.addEventListener('resize', handleHeaderOnScroll);
document.addEventListener('DOMContentLoaded', loadProjects);